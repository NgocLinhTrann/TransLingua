const express = require('express');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const pool = require('../models/db');

const router = express.Router();

// POST /api/feedback - Submit new feedback
router.post('/', authMiddleware, async (req, res) => {
    const { content } = req.body;
    try {
        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Feedback content cannot be empty' });
        }
        const result = await pool.query(
            'INSERT INTO feedback (user_id, content) VALUES ($1, $2) RETURNING *',
            [req.user.userId, content.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ message: 'Server error during feedback submission' });
    }
});

// GET /api/feedback - Fetch all feedback (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT f.feedback_id, f.content, f.created_at, u.email 
             FROM feedback f 
             JOIN users u ON f.user_id = u.user_id 
             ORDER BY f.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch feedback error:', error);
        res.status(500).json({ message: 'Server error during fetching feedback list' });
    }
});

module.exports = router;
