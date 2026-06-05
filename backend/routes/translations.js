const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../models/db');

const router = express.Router();

// GET /api/translations - Get all translations for logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM translations WHERE created_by = $1 ORDER BY created_at DESC',
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch translations error:', error);
        res.status(500).json({ message: 'Server error during fetching translations' });
    }
});

// POST /api/translations - Create new translation
router.post('/', authMiddleware, async (req, res) => {
    const { original_text, translated_text } = req.body;
    try {
        if (!original_text || !translated_text) {
            return res.status(400).json({ message: 'Original text and translated text are required' });
        }
        const result = await pool.query(
            'INSERT INTO translations (original_text, translated_text, created_by) VALUES ($1, $2, $3) RETURNING *',
            [original_text.trim(), translated_text.trim(), req.user.userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create translation error:', error);
        res.status(500).json({ message: 'Server error during creating translation' });
    }
});

// PUT /api/translations/:id - Update existing translation
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { original_text, translated_text } = req.body;
    try {
        if (!original_text || !translated_text) {
            return res.status(400).json({ message: 'Original text and translated text are required' });
        }
        const result = await pool.query(
            'UPDATE translations SET original_text = $1, translated_text = $2 WHERE id = $3 AND created_by = $4 RETURNING *',
            [original_text.trim(), translated_text.trim(), id, req.user.userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Translation not found or unauthorized' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update translation error:', error);
        res.status(500).json({ message: 'Server error during updating translation' });
    }
});

// DELETE /api/translations/:id - Delete translation
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM translations WHERE id = $1 AND created_by = $2 RETURNING *',
            [id, req.user.userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Translation not found or unauthorized' });
        }
        res.json({ message: 'Translation deleted successfully', entry: result.rows[0] });
    } catch (error) {
        console.error('Delete translation error:', error);
        res.status(500).json({ message: 'Server error during deleting translation' });
    }
});

module.exports = router;
