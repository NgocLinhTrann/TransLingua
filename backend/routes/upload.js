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

        // Validate that there are at least two columns
        const firstRow = data[0];
        if (!firstRow || firstRow.length < 2) {
            return res.status(400).json({ 
                message: 'Invalid spreadsheet structure. The Excel sheet must contain at least two columns (Chinese and Vietnamese).' 
            });
        }

        // Check if the first row is a header and should be skipped
        let startRow = 0;
        const col1 = String(firstRow[0] || '').toLowerCase();
        const col2 = String(firstRow[1] || '').toLowerCase();
        if (
            col1.includes('chinese') || col1.includes('original') || col1.includes('term') || col1.includes('zh') ||
            col2.includes('vietnamese') || col2.includes('translation') || col2.includes('vi')
        ) {
            startRow = 1;
        }

        const insertedRows = [];
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            
            for (let i = startRow; i < data.length; i++) {
                const row = data[i];
                if (!row || row.length < 2) continue; // Skip incomplete/empty rows
                
                const term = row[0] ? String(row[0]).trim() : '';
                const translation = row[1] ? String(row[1]).trim() : '';
                
                if (term && translation) {
                    const result = await client.query(
                        'INSERT INTO dictionary (term, translation, created_by) VALUES ($1, $2, $3) RETURNING *',
                        [term, translation, req.user.userId]
                    );
                    insertedRows.push(result.rows[0]);
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
