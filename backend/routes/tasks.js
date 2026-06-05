const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../models/db');

const router = express.Router();

// GET /api/tasks - Fetch all upload tasks for logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM translation_tasks WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch tasks error:', error);
        res.status(500).json({ message: 'Server error during fetching tasks list' });
    }
});

module.exports = router;
