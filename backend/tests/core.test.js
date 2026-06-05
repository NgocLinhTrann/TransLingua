const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock the database pool
const mockPool = {
    query: jest.fn(),
    connect: jest.fn()
};
jest.mock('../models/db', () => mockPool);

process.env.JWT_SECRET = 'test_secret';

const app = express();
app.use(express.json());
app.use('/api/translations', require('../routes/translations'));
app.use('/api/glossary', require('../routes/glossary'));
app.use('/api/dictionary', require('../routes/dictionary'));
app.use('/api/feedback', require('../routes/feedback'));
app.use('/api/tasks', require('../routes/tasks'));

describe('Core Features API Integration Tests', () => {
    let userToken, adminToken;

    beforeAll(() => {
        userToken = jwt.sign({ userId: 1, email: 'user@example.com', role: 'user' }, process.env.JWT_SECRET);
        adminToken = jwt.sign({ userId: 2, email: 'admin@translingua.com', role: 'admin' }, process.env.JWT_SECRET);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1. Translation Memory Tests
    describe('Translation Memory Scoped CRUD', () => {
        it('should fetch translations scoped only to the logged-in user', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ id: 1, original_text: '你好', translated_text: 'Xin chào', created_by: 1 }]
            });

            const response = await request(app)
                .get('/api/translations')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(mockPool.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM translations WHERE created_by = $1'),
                [1]
            );
        });

        it('should allow user to create a translation', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ id: 2, original_text: '谢谢', translated_text: 'Cảm ơn', created_by: 1 }]
            });

            const response = await request(app)
                .post('/api/translations')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ original_text: '谢谢', translated_text: 'Cảm ơn' });

            expect(response.status).toBe(201);
            expect(response.body.translated_text).toBe('Cảm ơn');
        });
    });

    // 2. Glossary Admin Scoping Tests
    describe('Glossary Admin Authorization Controls', () => {
        it('should allow any authenticated user to view glossary terms', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ term_id: 1, term: '确认', translation: 'xác nhận' }]
            });

            const response = await request(app)
                .get('/api/glossary')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
        });

        it('should reject standard users from creating glossary terms with 403', async () => {
            const response = await request(app)
                .post('/api/glossary')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ term: '确认', translation: 'xác nhận' });

            expect(response.status).toBe(403);
            expect(response.body.message).toContain('Admin');
        });

        it('should allow administrators to create glossary terms', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ term_id: 2, term: '提交', translation: 'gửi' }]
            });

            const response = await request(app)
                .post('/api/glossary')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ term: '提交', translation: 'gửi' });

            expect(response.status).toBe(201);
            expect(response.body.term).toBe('提交');
        });
    });

    // 3. User Feedback System Tests
    describe('Feedback Submission & Scopes', () => {
        it('should allow any user to submit feedback', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ feedback_id: 1, user_id: 1, content: 'Great site!' }]
            });

            const response = await request(app)
                .post('/api/feedback')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ content: 'Great site!' });

            expect(response.status).toBe(201);
            expect(response.body.content).toBe('Great site!');
        });

        it('should restrict standard users from viewing feedback logs', async () => {
            const response = await request(app)
                .get('/api/feedback')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
        });

        it('should allow admins to view feedback logs', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ feedback_id: 1, email: 'user@example.com', content: 'Great site!' }]
            });

            const response = await request(app)
                .get('/api/feedback')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
        });
    });
});
