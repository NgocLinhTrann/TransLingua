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

    // 4. Personal Dictionary Leitner & Collections Tests
    describe('Personal Dictionary Leitner & Collections', () => {
        it('should allow user to create custom collections when no duplicate exists', async () => {
            // First checkDup resolves to empty rows
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            // Second INSERT resolves to created collection
            mockPool.query.mockResolvedValueOnce({
                rows: [{ collection_id: 1, name: 'Technical', color_code: '#6366f1', created_by: 1, source_lang: 'zh' }]
            });

            const response = await request(app)
                .post('/api/dictionary/collections')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Technical', color_code: '#6366f1', source_lang: 'zh' });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('Technical');
        });

        it('should reject duplicate collection names with 400', async () => {
            // checkDup resolves to an existing row
            mockPool.query.mockResolvedValueOnce({ rows: [{ 1: 1 }] });

            const response = await request(app)
                .post('/api/dictionary/collections')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Technical', color_code: '#6366f1', source_lang: 'zh' });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('already exists');
        });

        it('should reject collection names longer than 40 characters with 400', async () => {
            const response = await request(app)
                .post('/api/dictionary/collections')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'a'.repeat(41), color_code: '#6366f1', source_lang: 'zh' });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('40 characters or less');
        });

        it('should reject duplicate vocabulary terms with 400', async () => {
            // checkDup resolves to an existing word under collections
            mockPool.query.mockResolvedValueOnce({
                rows: [{ dict_id: 1, term: '公司', collection_names: ['Business Vocabulary'] }]
            });

            const response = await request(app)
                .post('/api/dictionary')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ term: '公司', translation: 'công ty', source_lang: 'zh' });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('already exists in your dictionary');
            expect(response.body.message).toContain('Business Vocabulary');
        });

        it('should fetch flashcards review queue', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ dict_id: 1, term: '再见', translation: 'Tạm biệt', box_level: 1 }]
            });

            const response = await request(app)
                .get('/api/dictionary/review')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body[0].term).toBe('再见');
        });

        it('should update card box level on review submission', async () => {
            // Mock fetch current level
            mockPool.query.mockResolvedValueOnce({
                rows: [{ box_level: 1 }]
            });
            // Mock update query
            mockPool.query.mockResolvedValueOnce({
                rows: [{ dict_id: 1, box_level: 2 }]
            });

            const response = await request(app)
                .post('/api/dictionary/review/1')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ correct: true });

            expect(response.status).toBe(200);
            expect(response.body.entry.box_level).toBe(2);
        });

        it('should reject vocabulary term if notes exceed 500 characters', async () => {
            const longNotes = 'a'.repeat(501);
            const response = await request(app)
                .post('/api/dictionary')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ term: '公司', translation: 'công ty', notes: longNotes });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('500 characters or less');
        });

        it('should reject vocabulary term if examples exceed 5 sentences', async () => {
            const response = await request(app)
                .post('/api/dictionary')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    term: '公司',
                    translation: 'công ty',
                    examples: [
                        { original_sentence: '1', translated_sentence: '1' },
                        { original_sentence: '2', translated_sentence: '2' },
                        { original_sentence: '3', translated_sentence: '3' },
                        { original_sentence: '4', translated_sentence: '4' },
                        { original_sentence: '5', translated_sentence: '5' },
                        { original_sentence: '6', translated_sentence: '6' }
                    ]
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Maximum of 5 example sentences');
        });

        it('should reject vocabulary term if any example sentence exceeds 200 characters', async () => {
            const longSentence = 'a'.repeat(201);
            const response = await request(app)
                .post('/api/dictionary')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    term: '公司',
                    translation: 'công ty',
                    examples: [
                        { original_sentence: longSentence, translated_sentence: '1' }
                    ]
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('200 characters or less');
        });
    });
});
