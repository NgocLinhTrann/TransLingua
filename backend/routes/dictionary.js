const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../models/db');

const router = express.Router();

const { pinyin } = require('pinyin-pro');

// Helper function to fetch a term along with its aggregated collections and examples
const fetchTermWithDetails = async (dictId, userId, client = pool) => {
    const result = await client.query(
        `SELECT d.*, 
                COALESCE(
                  (SELECT json_agg(json_build_object('collection_id', col.collection_id, 'name', col.name, 'color_code', col.color_code)) 
                   FROM dictionary_collections dcol 
                   JOIN collections col ON dcol.collection_id = col.collection_id 
                   WHERE dcol.dict_id = d.dict_id), 
                  '[]'
                ) as collections,
                COALESCE(
                  (SELECT json_agg(json_build_object('example_id', ex.example_id, 'original_sentence', ex.original_sentence, 'translated_sentence', ex.translated_sentence)) 
                   FROM examples ex 
                   WHERE ex.dict_id = d.dict_id), 
                  '[]'
                ) as examples
         FROM dictionary d
         WHERE d.dict_id = $1 AND d.created_by = $2`,
        [dictId, userId]
    );
    return result.rows[0];
};

// Leitner system next review scheduler
const getNextReviewTime = (boxLevel) => {
    const now = new Date();
    switch (boxLevel) {
        case 1:
            now.setDate(now.getDate() + 1); // 1 day
            break;
        case 2:
            now.setDate(now.getDate() + 2); // 2 days
            break;
        case 3:
            now.setDate(now.getDate() + 5); // 5 days
            break;
        case 4:
            now.setDate(now.getDate() + 10); // 10 days
            break;
        case 5:
            now.setDate(now.getDate() + 30); // 30 days
            break;
        default:
            now.setDate(now.getDate() + 1);
    }
    return now;
};

// GET /api/dictionary/languages - Fetch all available languages
router.get('/languages', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM languages ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch languages error:', error);
        res.status(500).json({ message: 'Server error fetching languages' });
    }
});

// POST /api/dictionary/languages - Add a new custom language
router.post('/languages', authMiddleware, async (req, res) => {
    const { code, name } = req.body;
    if (!code || !name) {
        return res.status(400).json({ message: 'Language code and name are required' });
    }
    const codeClean = code.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!codeClean) {
        return res.status(400).json({ message: 'Invalid language code' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO languages (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING RETURNING *',
            [codeClean, name.trim()]
        );
        if (result.rows.length === 0) {
            return res.status(400).json({ message: `Language code "${codeClean}" already exists.` });
        }
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add language error:', error);
        res.status(500).json({ message: 'Server error adding language' });
    }
});

// GET /api/dictionary/pinyin - Generate pinyin for Chinese text
router.get('/pinyin', authMiddleware, async (req, res) => {
    const { text } = req.query;
    if (!text) {
        return res.status(400).json({ message: 'Text parameter is required' });
    }
    try {
        const result = pinyin(text, { toneType: 'symbol' });
        res.json({ pinyin: result });
    } catch (error) {
        console.error('Pinyin generation error:', error);
        res.status(500).json({ message: 'Error generating Pinyin' });
    }
});

// ==========================================
// 1. FLASHCARD STUDY ROUTES
// ==========================================

// GET /api/dictionary/review - Fetch cards currently due for review
router.get('/review', authMiddleware, async (req, res) => {
    const { source_lang, collection_id } = req.query;
    try {
        let queryText = `
            SELECT d.*, 
                    COALESCE(
                      (SELECT json_agg(json_build_object('collection_id', col.collection_id, 'name', col.name, 'color_code', col.color_code)) 
                       FROM dictionary_collections dcol 
                       JOIN collections col ON dcol.collection_id = col.collection_id 
                       WHERE dcol.dict_id = d.dict_id), 
                      '[]'
                    ) as collections,
                    COALESCE(
                      (SELECT json_agg(json_build_object('example_id', ex.example_id, 'original_sentence', ex.original_sentence, 'translated_sentence', ex.translated_sentence)) 
                       FROM examples ex 
                       WHERE ex.dict_id = d.dict_id), 
                      '[]'
                    ) as examples
             FROM dictionary d
             WHERE d.created_by = $1 AND d.next_review_at <= NOW()
        `;
        const queryParams = [req.user.userId];
        
        if (source_lang && source_lang !== 'all') {
            queryParams.push(source_lang);
            queryText += ` AND d.source_lang = $${queryParams.length}`;
        }
        
        if (collection_id && collection_id !== 'all') {
            queryParams.push(parseInt(collection_id, 10));
            queryText += ` AND EXISTS (
                SELECT 1 FROM dictionary_collections dc 
                WHERE dc.dict_id = d.dict_id AND dc.collection_id = $${queryParams.length}
            )`;
        }
        
        queryText += ` ORDER BY d.box_level ASC, d.next_review_at ASC`;

        const result = await pool.query(queryText, queryParams);
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch review queue error:', error);
        res.status(500).json({ message: 'Server error during fetching review queue' });
    }
});

// POST /api/dictionary/review/:id - Record study card outcome (Correct/Incorrect)
router.post('/review/:id', authMiddleware, async (req, res) => {
    const dictId = parseInt(req.params.id, 10);
    if (isNaN(dictId)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    const { correct } = req.body;
    if (correct === undefined) {
        return res.status(400).json({ message: 'Correct parameter (boolean) is required' });
    }

    try {
        // Fetch current level
        const currentResult = await pool.query(
            'SELECT box_level FROM dictionary WHERE dict_id = $1 AND created_by = $2',
            [dictId, req.user.userId]
        );
        if (currentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Dictionary entry not found' });
        }

        let newLevel = 1;
        if (correct) {
            const currentLevel = currentResult.rows[0].box_level;
            newLevel = Math.min(currentLevel + 1, 5);
        }

        const nextReviewAt = getNextReviewTime(newLevel);

        const updateResult = await pool.query(
            'UPDATE dictionary SET box_level = $1, next_review_at = $2 WHERE dict_id = $3 AND created_by = $4 RETURNING *',
            [newLevel, nextReviewAt, dictId, req.user.userId]
        );

        res.json({ message: 'Review recorded successfully', entry: updateResult.rows[0] });
    } catch (error) {
        console.error('Record review outcome error:', error);
        res.status(500).json({ message: 'Server error recording flashcard review' });
    }
});

// ==========================================
// 2. BULK OPERATIONS ROUTES
// ==========================================

// POST /api/dictionary/bulk-delete - Delete multiple terms at once
router.post('/bulk-delete', authMiddleware, async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid or empty list of term IDs' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM dictionary WHERE dict_id = ANY($1) AND created_by = $2 RETURNING dict_id',
            [ids, req.user.userId]
        );
        res.json({ message: `Successfully deleted ${result.rows.length} dictionary entries.`, deletedCount: result.rows.length });
    } catch (error) {
        console.error('Bulk delete dictionary terms error:', error);
        res.status(500).json({ message: 'Server error during bulk deletion' });
    }
});

// POST /api/dictionary/bulk-tag - Associate multiple terms with a collection
router.post('/bulk-tag', authMiddleware, async (req, res) => {
    const { ids, collection_id } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !collection_id) {
        return res.status(400).json({ message: 'Term IDs array and collection_id are required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Ensure the collection is owned by the user
        const colCheck = await client.query(
            'SELECT 1 FROM collections WHERE collection_id = $1 AND created_by = $2',
            [collection_id, req.user.userId]
        );
        if (colCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'Unauthorized or invalid collection ID' });
        }

        let addedCount = 0;
        for (const dictId of ids) {
            // Check if the term is owned by the user
            const termCheck = await client.query(
                'SELECT 1 FROM dictionary WHERE dict_id = $1 AND created_by = $2',
                [dictId, req.user.userId]
            );
            if (termCheck.rows.length === 0) continue;

            // Associate (using ON CONFLICT to ignore duplicates)
            await client.query(
                'INSERT INTO dictionary_collections (dict_id, collection_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [dictId, collection_id]
            );
            addedCount++;
        }

        await client.query('COMMIT');
        res.json({ message: `Successfully categorized ${addedCount} items.`, addedCount });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Bulk tag dictionary terms error:', error);
        res.status(500).json({ message: 'Server error during bulk categorization' });
    } finally {
        client.release();
    }
});

// ==========================================
// 3. COLLECTIONS CRUD ROUTES
// ==========================================

// GET /api/collections - Fetch user tags/collections
router.get('/collections', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM collections WHERE created_by = $1 ORDER BY name ASC',
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch collections error:', error);
        res.status(500).json({ message: 'Server error during fetching collections' });
    }
});

// POST /api/collections - Create new collection
router.post('/collections', authMiddleware, async (req, res) => {
    const { name, color_code, source_lang } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Collection name is required' });
    }
    if (name.trim().length > 40) {
        return res.status(400).json({ message: 'Collection name must be 40 characters or less' });
    }
    const color = color_code || '#6366f1';
    const sourceLang = source_lang || 'zh';

    try {
        // Check duplicate name for this user & language
        const checkDup = await pool.query(
            'SELECT 1 FROM collections WHERE created_by = $1 AND LOWER(name) = LOWER($2) AND source_lang = $3',
            [req.user.userId, name.trim(), sourceLang]
        );
        if (checkDup.rows.length > 0) {
            return res.status(400).json({ message: `A collection named "${name.trim()}" already exists for this language.` });
        }

        const result = await pool.query(
            'INSERT INTO collections (name, color_code, created_by, source_lang) VALUES ($1, $2, $3, $4) RETURNING *',
            [name.trim(), color, req.user.userId, sourceLang]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create collection error:', error);
        res.status(500).json({ message: 'Server error during creating collection' });
    }
});

// PUT /api/collections/:id - Rename/update existing collection
router.put('/collections/:id', authMiddleware, async (req, res) => {
    const collectionId = parseInt(req.params.id, 10);
    if (isNaN(collectionId)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    const { name, color_code } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Collection name is required' });
    }
    if (name.trim().length > 40) {
        return res.status(400).json({ message: 'Collection name must be 40 characters or less' });
    }
    const color = color_code || '#6366f1';

    try {
        // Fetch current collection to get its source_lang for duplicate check
        const current = await pool.query(
            'SELECT source_lang FROM collections WHERE collection_id = $1 AND created_by = $2',
            [collectionId, req.user.userId]
        );
        if (current.rows.length === 0) {
            return res.status(404).json({ message: 'Collection not found or unauthorized' });
        }
        const sourceLang = current.rows[0].source_lang;

        // Check if new name already exists for this user + language (excluding itself)
        const dupCheck = await pool.query(
            'SELECT 1 FROM collections WHERE created_by = $1 AND LOWER(name) = LOWER($2) AND source_lang = $3 AND collection_id != $4',
            [req.user.userId, name.trim(), sourceLang, collectionId]
        );
        if (dupCheck.rows.length > 0) {
            return res.status(400).json({ message: `A collection named "${name.trim()}" already exists for this language.` });
        }

        const result = await pool.query(
            'UPDATE collections SET name = $1, color_code = $2 WHERE collection_id = $3 AND created_by = $4 RETURNING *',
            [name.trim(), color, collectionId, req.user.userId]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update collection error:', error);
        res.status(500).json({ message: 'Server error during updating collection' });
    }
});


// DELETE /api/collections/:id - Delete collection
router.delete('/collections/:id', authMiddleware, async (req, res) => {
    const collectionId = parseInt(req.params.id, 10);
    if (isNaN(collectionId)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM collections WHERE collection_id = $1 AND created_by = $2 RETURNING *',
            [collectionId, req.user.userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Collection not found or unauthorized' });
        }
        res.json({ message: 'Collection deleted successfully', collection: result.rows[0] });
    } catch (error) {
        console.error('Delete collection error:', error);
        res.status(500).json({ message: 'Server error during deleting collection' });
    }
});

// ==========================================
// 4. DICTIONARY TERMS CRUD ROUTES
// ==========================================

// GET /api/dictionary - Fetch all user terms with collections & examples
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT d.*, 
                    COALESCE(
                      (SELECT json_agg(json_build_object('collection_id', col.collection_id, 'name', col.name, 'color_code', col.color_code)) 
                       FROM dictionary_collections dcol 
                       JOIN collections col ON dcol.collection_id = col.collection_id 
                       WHERE dcol.dict_id = d.dict_id), 
                      '[]'
                    ) as collections,
                    COALESCE(
                      (SELECT json_agg(json_build_object('example_id', ex.example_id, 'original_sentence', ex.original_sentence, 'translated_sentence', ex.translated_sentence)) 
                       FROM examples ex 
                       WHERE ex.dict_id = d.dict_id), 
                      '[]'
                    ) as examples
             FROM dictionary d
             WHERE d.created_by = $1
             ORDER BY d.dict_id DESC`,
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch dictionary error:', error);
        res.status(500).json({ message: 'Server error during fetching dictionary entries' });
    }
});

// POST /api/dictionary - Add a single dictionary term manually
router.post('/', authMiddleware, async (req, res) => {
    const { 
        term, 
        translation, 
        source_lang, 
        target_lang, 
        pronunciation, 
        part_of_speech, 
        notes, 
        collection_ids, 
        examples 
    } = req.body;

    if (!term || !translation) {
        return res.status(400).json({ message: 'Term and translation are required' });
    }

    if (notes && notes.length > 500) {
        return res.status(400).json({ message: 'Custom notes must be 500 characters or less' });
    }

    const validExamples = Array.isArray(examples) 
        ? examples.filter(ex => ex.original_sentence || ex.translated_sentence) 
        : [];
    if (validExamples.length > 5) {
        return res.status(400).json({ message: 'Maximum of 5 example sentences is allowed' });
    }

    for (const ex of validExamples) {
        if ((ex.original_sentence && ex.original_sentence.length > 200) || 
            (ex.translated_sentence && ex.translated_sentence.length > 200)) {
            return res.status(400).json({ message: 'Example sentences must be 200 characters or less' });
        }
    }

    const sourceLang = source_lang || 'zh';
    const targetLang = target_lang || 'vi';

    try {
        // Check duplicate word entry
        const checkDup = await pool.query(
            `SELECT d.dict_id, d.term, 
                    COALESCE(
                        (SELECT json_agg(col.name) 
                         FROM dictionary_collections dcol 
                         JOIN collections col ON dcol.collection_id = col.collection_id 
                         WHERE dcol.dict_id = d.dict_id),
                        '[]'
                    ) as collection_names
             FROM dictionary d
             WHERE d.created_by = $1 AND LOWER(d.term) = LOWER($2) AND d.source_lang = $3`,
            [req.user.userId, term.trim(), sourceLang]
        );
        if (checkDup.rows.length > 0) {
            const existing = checkDup.rows[0];
            const cols = existing.collection_names || [];
            const colMsg = cols.length > 0 ? `under collection(s): ${cols.join(', ')}` : 'in no collections';
            return res.status(400).json({ 
                message: `The term "${term.trim()}" already exists in your dictionary (${colMsg}). You can search for it in your dictionary list.` 
            });
        }
    } catch (err) {
        console.error('Check duplicate word error:', err);
        return res.status(500).json({ message: 'Server error checking duplicate entry' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert primary term row
        const result = await client.query(
            `INSERT INTO dictionary (
                source_lang, target_lang, term, pronunciation, translation, part_of_speech, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING dict_id`,
            [
                sourceLang, 
                targetLang, 
                term.trim(), 
                pronunciation ? pronunciation.trim() : null, 
                translation.trim(), 
                part_of_speech ? part_of_speech.trim() : null, 
                notes ? notes.trim() : null, 
                req.user.userId
            ]
        );
        const dictId = result.rows[0].dict_id;

        // Insert collections relationships
        if (Array.isArray(collection_ids) && collection_ids.length > 0) {
            for (const colId of collection_ids) {
                await client.query(
                    'INSERT INTO dictionary_collections (dict_id, collection_id) VALUES ($1, $2)',
                    [dictId, colId]
                );
            }
        }

        // Insert custom usage example sentences
        if (Array.isArray(examples) && examples.length > 0) {
            for (const ex of examples) {
                if (ex.original_sentence && ex.translated_sentence) {
                    await client.query(
                        'INSERT INTO examples (dict_id, original_sentence, translated_sentence) VALUES ($1, $2, $3)',
                        [dictId, ex.original_sentence.trim(), ex.translated_sentence.trim()]
                    );
                }
            }
        }

        await client.query('COMMIT');

        // Retrieve fully aggregated output
        const responseData = await fetchTermWithDetails(dictId, req.user.userId);
        res.status(201).json(responseData);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create dictionary term error:', error);
        res.status(500).json({ message: 'Server error during creating dictionary entry' });
    } finally {
        client.release();
    }
});

// PUT /api/dictionary/:id - Edit a dictionary entry
router.put('/:id', authMiddleware, async (req, res) => {
    const dictId = parseInt(req.params.id, 10);
    if (isNaN(dictId)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    const { 
        term, 
        translation, 
        source_lang, 
        target_lang, 
        pronunciation, 
        part_of_speech, 
        notes, 
        collection_ids, 
        examples 
    } = req.body;

    if (!term || !translation) {
        return res.status(400).json({ message: 'Term and translation are required' });
    }

    if (notes && notes.length > 500) {
        return res.status(400).json({ message: 'Custom notes must be 500 characters or less' });
    }

    const validExamples = Array.isArray(examples) 
        ? examples.filter(ex => ex.original_sentence || ex.translated_sentence) 
        : [];
    if (validExamples.length > 5) {
        return res.status(400).json({ message: 'Maximum of 5 example sentences is allowed' });
    }

    for (const ex of validExamples) {
        if ((ex.original_sentence && ex.original_sentence.length > 200) || 
            (ex.translated_sentence && ex.translated_sentence.length > 200)) {
            return res.status(400).json({ message: 'Example sentences must be 200 characters or less' });
        }
    }

    const sourceLang = source_lang || 'zh';
    const targetLang = target_lang || 'vi';

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update primary row
        const result = await client.query(
            `UPDATE dictionary 
             SET source_lang = $1, target_lang = $2, term = $3, pronunciation = $4, 
                 translation = $5, part_of_speech = $6, notes = $7 
             WHERE dict_id = $8 AND created_by = $9 RETURNING dict_id`,
            [
                sourceLang, 
                targetLang, 
                term.trim(), 
                pronunciation ? pronunciation.trim() : null, 
                translation.trim(), 
                part_of_speech ? part_of_speech.trim() : null, 
                notes ? notes.trim() : null, 
                dictId,
                req.user.userId
            ]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Dictionary entry not found or unauthorized' });
        }

        // Refresh collections mappings
        await client.query('DELETE FROM dictionary_collections WHERE dict_id = $1', [dictId]);
        if (Array.isArray(collection_ids) && collection_ids.length > 0) {
            for (const colId of collection_ids) {
                await client.query(
                    'INSERT INTO dictionary_collections (dict_id, collection_id) VALUES ($1, $2)',
                    [dictId, colId]
                );
            }
        }

        // Refresh examples sentences
        await client.query('DELETE FROM examples WHERE dict_id = $1', [dictId]);
        if (Array.isArray(examples) && examples.length > 0) {
            for (const ex of examples) {
                if (ex.original_sentence && ex.translated_sentence) {
                    await client.query(
                        'INSERT INTO examples (dict_id, original_sentence, translated_sentence) VALUES ($1, $2, $3)',
                        [dictId, ex.original_sentence.trim(), ex.translated_sentence.trim()]
                    );
                }
            }
        }

        await client.query('COMMIT');

        const responseData = await fetchTermWithDetails(dictId, req.user.userId);
        res.json(responseData);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update dictionary term error:', error);
        res.status(500).json({ message: 'Server error during updating dictionary entry' });
    } finally {
        client.release();
    }
});

// DELETE /api/dictionary/:id - Remove a dictionary entry (Cascades constraints automatically)
router.delete('/:id', authMiddleware, async (req, res) => {
    const dictId = parseInt(req.params.id, 10);
    if (isNaN(dictId)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM dictionary WHERE dict_id = $1 AND created_by = $2 RETURNING *',
            [dictId, req.user.userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Dictionary entry not found or unauthorized' });
        }
        res.json({ message: 'Dictionary entry deleted successfully', entry: result.rows[0] });
    } catch (error) {
        console.error('Delete dictionary term error:', error);
        res.status(500).json({ message: 'Server error during deleting dictionary entry' });
    }
});

module.exports = router;
