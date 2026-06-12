const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const xlsx = require('xlsx');

// Mock the database pool
const mockClient = {
    query: jest.fn(),
    release: jest.fn()
};
const mockPool = {
    connect: jest.fn().mockResolvedValue(mockClient),
    query: jest.fn()
};
jest.mock('../models/db', () => mockPool);

process.env.JWT_SECRET = 'test_secret';

const app = express();
app.use(express.json());
app.use('/api/files', require('../routes/upload'));

// Generate a valid Excel file buffer for testing
const createExcelBuffer = (rows) => {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(rows);
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

describe('File Upload API Endpoints', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ userId: 1, email: 'test@example.com' }, process.env.JWT_SECRET);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/files/upload', () => {
        it('should return 401 if authorization token is missing', async () => {
            const response = await request(app)
                .post('/api/files/upload');
            expect(response.status).toBe(401);
            expect(response.body.message).toContain('missing');
        });

        it('should return 400 if no file is uploaded', async () => {
            const response = await request(app)
                .post('/api/files/upload')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('No file uploaded');
        });

        it('should return 400 if file format is invalid', async () => {
            const response = await request(app)
                .post('/api/files/upload')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', Buffer.from('hello text'), 'test.txt');
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Invalid file format');
        });

        it('should successfully parse a valid Excel file with required Term/Translation headers and link to collections', async () => {
            const excelBuffer = createExcelBuffer([
                ['Term', 'Translation', 'Pronunciation', 'Category', 'Notes'],
                ['hola', 'xin chào', 'o-la', 'Verb', 'Greeting in Spanish'],
                ['gracias', 'cảm ơn', 'gra-syas', 'Noun', 'Thanks in Spanish']
            ]);

            mockClient.query.mockResolvedValueOnce({}); // BEGIN
            mockClient.query.mockResolvedValueOnce({}); // INSERT source language
            mockClient.query.mockResolvedValueOnce({}); // INSERT target language
            mockClient.query.mockResolvedValueOnce({ rows: [{ dict_id: 10, term: 'hola' }] }); // INSERT term 1
            mockClient.query.mockResolvedValueOnce({}); // LINK collection 1 to term 1
            mockClient.query.mockResolvedValueOnce({}); // LINK collection 2 to term 1
            mockClient.query.mockResolvedValueOnce({ rows: [{ dict_id: 11, term: 'gracias' }] }); // INSERT term 2
            mockClient.query.mockResolvedValueOnce({}); // LINK collection 1 to term 2
            mockClient.query.mockResolvedValueOnce({}); // LINK collection 2 to term 2
            mockClient.query.mockResolvedValueOnce({}); // INSERT task log
            mockClient.query.mockResolvedValueOnce({}); // COMMIT

            const response = await request(app)
                .post('/api/files/upload')
                .set('Authorization', `Bearer ${token}`)
                .field('source_lang', 'es')
                .field('target_lang', 'vi')
                .field('collection_ids', JSON.stringify([5, 8]))
                .attach('file', excelBuffer, 'spanish.xlsx');

            expect(response.status).toBe(201);
            expect(response.body.count).toBe(2);
            expect(response.body.entries[0].term).toBe('hola');
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
        });

        it('should return 400 if required headers (Term/Translation) are missing', async () => {
            const excelBuffer = createExcelBuffer([
                ['Pronunciation', 'Category', 'Notes'],
                ['o-la', 'Verb', 'Greeting']
            ]);

            const response = await request(app)
                .post('/api/files/upload')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', excelBuffer, 'invalid.xlsx');

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Missing required headers');
        });

        it('should return 400 if sheet structure contains less than two columns', async () => {
            const excelBuffer = createExcelBuffer([
                ['SingleColumn'],
                ['test']
            ]);

            const response = await request(app)
                .post('/api/files/upload')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', excelBuffer, 'invalid_struct.xlsx');

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('spreadsheet structure');
        });
    });
});
