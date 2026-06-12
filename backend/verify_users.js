const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verifyAllUnverified() {
    try {
        const result = await pool.query(
            `UPDATE users SET is_verified = true WHERE is_verified = false RETURNING email, is_verified`
        );
        console.log('Verified accounts:', result.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

verifyAllUnverified();
