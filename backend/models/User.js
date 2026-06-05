const pool = require('./db');
const bcrypt = require('bcrypt');

class User {
    static async createUser(email, password, role, verificationToken) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, role, verification_token, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, hashedPassword, role, verificationToken, false]
        );
        return result.rows[0];
    }

    static async findUserByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    static async verifyUserByToken(token) {
        const result = await pool.query(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING *',
            [token]
        );
        return result.rows[0];
    }

    static async setPasswordResetToken(email, token, expires) {
        const result = await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3 RETURNING *',
            [token, expires, email]
        );
        return result.rows[0];
    }

    static async resetPasswordByToken(token, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await pool.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = $2 AND reset_token_expires > NOW() RETURNING *',
            [hashedPassword, token]
        );
        return result.rows[0];
    }
}

module.exports = User;