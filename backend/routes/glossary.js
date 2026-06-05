const express = require('express');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const pool = require('../models/db');

const router = express.Router();

// GET /api/glossary - Read glossary terms (available to all logged-in users)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM glossary ORDER BY term ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch glossary error:', error);
        res.status(500).json({ message: 'Server error during fetching glossary' });
    }
});

// POST /api/glossary - Create standard glossary term (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    const { term, translation } = req.body;
    try {
        if (!term || !translation) {
            return res.status(400).json({ message: 'Term and translation are required' });
        }
        const result = await pool.query(
            'INSERT INTO glossary (term, translation, created_by) VALUES ($1, $2, $3) RETURNING *',
            [term.trim(), translation.trim(), req.user.userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create glossary term error:', error);
        res.status(500).json({ message: 'Server error during creating glossary term' });
    }
});

// PUT /api/glossary/:id - Update standard glossary term (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { term, translation } = req.body;
    try {
        if (!term || !translation) {
            return res.status(400).json({ message: 'Term and translation are required' });
        }
        const result = await pool.query(
            'UPDATE glossary SET term = $1, translation = $2 WHERE term_id = $3 RETURNING *',
            [term.trim(), translation.trim(), id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Glossary term not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update glossary term error:', error);
        res.status(500).json({ message: 'Server error during updating glossary term' });
    }
});

// DELETE /api/glossary/:id - Delete standard glossary term (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM glossary WHERE term_id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Glossary term not found' });
        }
        res.json({ message: 'Glossary term deleted successfully', entry: result.rows[0] });
    } catch (error) {
        console.error('Delete glossary term error:', error);
        res.status(500).json({ message: 'Server error during deleting glossary term' });
    }
});

module.exports = router;
