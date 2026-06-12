const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock the database pool
const mockPool = {
    query: jest.fn(),
    connect: jest.fn()
};
jest.mock('../models/db', () => mockPool);

// Set environment variables for testing
process.env.JWT_SECRET = 'test_secret';
process.env.DATABASE_URL = 'postgresql://localhost/mock';

const app = express();
app.use(express.json());
app.use('/api/auth', require('../routes/auth'));

describe('Authentication API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should successfully register a new user and return 210', async () => {
            // First mock query checks for existing user (returns empty rows)
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            // Second mock query inserts the new user (returns inserted user)
            mockPool.query.mockResolvedValueOnce({
                rows: [{ user_id: 1, email: 'test@example.com', role: 'user' }]
            });

            const response = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(201);
            expect(response.body.message).toContain('Registration successful');
            expect(response.body.userId).toBe(1);
            expect(mockPool.query).toHaveBeenCalledTimes(2);
        });

        it('should return 400 if email already exists', async () => {
            // Mock query returns an existing user
            mockPool.query.mockResolvedValueOnce({
                rows: [{ user_id: 1, email: 'test@example.com' }]
            });

            const response = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User already exists');
        });
    });

    describe('GET /api/auth/verify-email', () => {
        it('should verify email and set is_verified to true', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ user_id: 1, email: 'test@example.com', is_verified: true }]
            });

            const response = await request(app)
                .get('/api/auth/verify-email')
                .query({ token: 'mocktoken' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Email verified successfully. You can now log in.');
        });

        it('should return 400 for invalid token', async () => {
            // Return empty rows representing no user matches the verification token
            mockPool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .get('/api/auth/verify-email')
                .query({ token: 'invalidtoken' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid or expired verification token');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should successfully log in and return a JWT token', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            mockPool.query.mockResolvedValueOnce({
                rows: [{ user_id: 1, email: 'test@example.com', password_hash: hashedPassword, role: 'user', is_verified: true }]
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(200);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.email).toBe('test@example.com');
        });

        it('should return 403 if email is not verified', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            mockPool.query.mockResolvedValueOnce({
                rows: [{ user_id: 1, email: 'test@example.com', password_hash: hashedPassword, role: 'user', is_verified: false }]
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Please verify your email address before logging in.');
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        it('should return 200 confirming reset process initiated', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ user_id: 1, email: 'test@example.com' }]
            });
            mockPool.query.mockResolvedValueOnce({
                rows: [{ user_id: 1, email: 'test@example.com', reset_token: 'token' }]
            });

            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'test@example.com' });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('Password reset link generated');
        });
    });

    describe('POST /api/auth/reset-password', () => {
        it('should successfully update the password', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ user_id: 1, email: 'test@example.com' }]
            });

            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({ token: 'resettoken', newPassword: 'newpassword123' });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('reset successfully');
        });
    });
});
