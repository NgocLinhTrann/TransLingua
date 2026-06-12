const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const role = email.endsWith('@translingua.com') ? 'admin' : 'user';
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const newUser = await User.createUser(email, password, role, verificationToken);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const autoVerify = process.env.AUTO_VERIFY_EMAIL === 'true';

        if (autoVerify) {
            // Auto-verify in dev mode — no email click required
            await User.verifyUserByToken(verificationToken);
            console.log(`\n[DEV] Auto-verified account: ${email}`);
            res.status(201).json({ 
                message: 'Registration successful! Your account has been automatically verified. You can log in now.',
                userId: newUser.user_id, 
                email: newUser.email,
                verified: true
            });
        } else {
            // Simulate sending email verification link
            const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
            console.log('\n--- EMAIL SIMULATION ---');
            console.log(`To: ${email}`);
            console.log(`Subject: Verify your TransLingua Account`);
            console.log(`Link: ${verificationLink}`);
            console.log('------------------------\n');

            res.status(201).json({ 
                message: `Registration successful. Open this link to verify: ${verificationLink}`,
                userId: newUser.user_id, 
                email: newUser.email,
                verified: false
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Verify email
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    try {
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }
        const user = await User.verifyUserByToken(token);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }
        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Server error during email verification' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User.findUserByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (!user.is_verified) {
            return res.status(403).json({ message: 'Please verify your email address before logging in.' });
        }
        
        const token = jwt.sign(
            { userId: user.user_id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        res.json({ token, user: { userId: user.user_id, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const user = await User.findUserByEmail(email);
        let resetLink = null;
        if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const expires = new Date(Date.now() + 3600000); // 1 hour expiry
            await User.setPasswordResetToken(email, resetToken, expires);

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

            // Simulate sending password reset email
            console.log('\n--- EMAIL SIMULATION ---');
            console.log(`To: ${email}`);
            console.log(`Subject: Reset your TransLingua Password`);
            console.log(`Link: ${resetLink}`);
            console.log('------------------------\n');
        }
        
        // Return the link directly so user can use it without checking console
        res.json({ 
            message: resetLink 
                ? `Password reset link generated. Click it to reset: ${resetLink}`
                : 'If an account exists with that email, a password reset link has been generated.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error during password reset request' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }
        const user = await User.resetPasswordByToken(token, newPassword);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        res.json({ message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

module.exports = router;