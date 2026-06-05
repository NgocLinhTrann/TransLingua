const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../models/db');

const router = express.Router();

// GET /api/dictionary - Fetch all personal dictionary entries
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM dictionary WHERE created_by = $1 ORDER BY dict_id DESC',
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
    const { term, translation } = req.body;
    try {
        if (!term || !translation) {
            return res.status(400).json({ message: 'Term and translation are required' });
        }
        const result = await pool.query(
            'INSERT INTO dictionary (term, translation, created_by) VALUES ($1, $2, $3) RETURNING *',
            [term.trim(), translation.trim(), req.user.userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create dictionary term error:', error);
        res.status(500).json({ message: 'Server error during creating dictionary entry' });
    }
});

// PUT /api/dictionary/:id - Edit a dictionary entry
router.put('/:id', authMiddleware, async (req, res) => {
    const dictId = parseInt(req.params.id, 10);
    if (isNaN(dictId)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    const { term, translation } = req.body;
    try {
        if (!term || !translation) {
            return res.status(400).json({ message: 'Term and translation are required' });
        }
        const result = await pool.query(
            'UPDATE dictionary SET term = $1, translation = $2 WHERE dict_id = $3 AND created_by = $4 RETURNING *',
            [term.trim(), translation.trim(), dictId, req.user.userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Dictionary entry not found or unauthorized' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update dictionary term error:', error);
        res.status(500).json({ message: 'Server error during updating dictionary entry' });
    }
});

// DELETE /api/dictionary/:id - Remove a dictionary entry
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
