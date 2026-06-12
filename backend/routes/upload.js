const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const pool = require('../models/db');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const LANG_NAMES = {
    'zh': 'Chinese',
    'es': 'Spanish',
    'en': 'English',
    'hi': 'Hindi',
    'ar': 'Arabic',
    'bn': 'Bengali',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'pa': 'Punjabi',
    'de': 'German',
    'jv': 'Javanese',
    'ms': 'Malay/Indonesian',
    'ko': 'Korean',
    'fr': 'French',
    'te': 'Telugu',
    'vi': 'Vietnamese',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'ur': 'Urdu',
    'tr': 'Turkish',
    'it': 'Italian',
    'yue': 'Cantonese',
    'th': 'Thai',
    'gu': 'Gujarati',
    'pl': 'Polish',
    'uk': 'Ukrainian',
    'fa': 'Persian',
    'ml': 'Malayalam',
    'kn': 'Kannada',
    'or': 'Oriya'
};

const registerLanguage = async (client, code) => {
    const name = LANG_NAMES[code] || code.toUpperCase();
    await client.query(
        'INSERT INTO languages (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING',
        [code, name]
    );
};

// POST /api/files/upload
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Validate file extension
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (ext !== '.xlsx' && ext !== '.xls') {
            return res.status(400).json({ message: 'Invalid file format. Only Excel files (.xlsx, .xls) are allowed.' });
        }

        // Read Excel sheet
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Parse rows as raw array of arrays
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        if (data.length === 0) {
            return res.status(400).json({ message: 'The uploaded file is empty' });
        }

        const headerRow = data[0];
        if (!headerRow || headerRow.length < 2) {
            return res.status(400).json({ 
                message: 'Invalid spreadsheet structure. The Excel sheet must contain a header row with at least Term/Original and Translation/Meaning columns.' 
            });
        }

        let termColIdx = -1;
        let translationColIdx = -1;
        let pronunciationColIdx = -1;
        let categoryColIdx = -1;
        let notesColIdx = -1;

        for (let idx = 0; idx < headerRow.length; idx++) {
            const cellVal = String(headerRow[idx] || '').trim().toLowerCase();
            if (cellVal === 'term' || cellVal === 'original' || cellVal === 'word') {
                termColIdx = idx;
            } else if (cellVal === 'translation' || cellVal === 'meaning') {
                translationColIdx = idx;
            } else if (cellVal === 'pronunciation' || cellVal === 'pinyin') {
                pronunciationColIdx = idx;
            } else if (cellVal === 'category' || cellVal === 'part of speech' || cellVal === 'pos') {
                categoryColIdx = idx;
            } else if (cellVal === 'notes' || cellVal === 'note') {
                notesColIdx = idx;
            }
        }

        // Validate required headers
        if (termColIdx === -1 || translationColIdx === -1) {
            return res.status(400).json({
                message: 'Missing required headers in spreadsheet. First row must contain columns named "Term" (or "Original") and "Translation" (or "Meaning").'
            });
        }

        // Get options from body
        const sourceLang = req.body.source_lang || 'zh';
        const targetLang = req.body.target_lang || 'vi';

        let collectionIds = [];
        if (req.body.collection_ids) {
            try {
                if (typeof req.body.collection_ids === 'string') {
                    collectionIds = JSON.parse(req.body.collection_ids);
                } else if (Array.isArray(req.body.collection_ids)) {
                    collectionIds = req.body.collection_ids;
                } else {
                    collectionIds = [req.body.collection_ids];
                }
            } catch (err) {
                collectionIds = [req.body.collection_ids];
            }
        }
        collectionIds = collectionIds.map(id => parseInt(id)).filter(id => !isNaN(id));

        const insertedRows = [];
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Auto register languages
            await registerLanguage(client, sourceLang);
            await registerLanguage(client, targetLang);
            
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                if (!row) continue;
                
                const term = row[termColIdx] ? String(row[termColIdx]).trim() : '';
                const translation = row[translationColIdx] ? String(row[translationColIdx]).trim() : '';
                
                if (term && translation) {
                    const pronunciation = pronunciationColIdx !== -1 && row[pronunciationColIdx] ? String(row[pronunciationColIdx]).trim() : null;
                    const partOfSpeech = categoryColIdx !== -1 && row[categoryColIdx] ? String(row[categoryColIdx]).trim() : null;
                    const notes = notesColIdx !== -1 && row[notesColIdx] ? String(row[notesColIdx]).trim() : null;

                    // Length validations matching manual adds
                    if (term.length > 255) continue;
                    if (translation.length > 2000) continue;
                    if (pronunciation && pronunciation.length > 255) continue;
                    if (partOfSpeech && partOfSpeech.length > 50) continue;
                    if (notes && notes.length > 500) continue;

                    const result = await client.query(
                        'INSERT INTO dictionary (source_lang, target_lang, term, pronunciation, translation, part_of_speech, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                        [sourceLang, targetLang, term, pronunciation, translation, partOfSpeech, notes, req.user.userId]
                    );
                    
                    const dictEntry = result.rows[0];
                    insertedRows.push(dictEntry);

                    if (collectionIds.length > 0) {
                        for (const colId of collectionIds) {
                            await client.query(
                                'INSERT INTO dictionary_collections (dict_id, collection_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                                [dictEntry.dict_id, colId]
                            );
                        }
                    }
                }
            }
            
            await client.query(
                'INSERT INTO translation_tasks (user_id, file_name, status, total_terms) VALUES ($1, $2, $3, $4)',
                [req.user.userId, req.file.originalname, 'completed', insertedRows.length]
            );
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        res.status(201).json({
            message: `Successfully imported ${insertedRows.length} entries to your dictionary.`,
            count: insertedRows.length,
            entries: insertedRows
        });

    } catch (error) {
        console.error('File upload/parsing error:', error);
        res.status(500).json({ message: 'Server error during file parsing and storage' });
    }
});

module.exports = router;
