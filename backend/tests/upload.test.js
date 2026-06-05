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

        it('should successfully parse a valid Excel file and insert rows', async () => {
            const excelBuffer = createExcelBuffer([
                ['Chinese', 'Vietnamese'],
                ['你好', 'Xin chào'],
                ['谢谢', 'Cảm ơn']
            ]);

            mockClient.query.mockResolvedValueOnce({}); // BEGIN
            mockClient.query.mockResolvedValueOnce({ rows: [{ dict_id: 1, term: '你好', translation: 'Xin chào', created_by: 1 }] }); // INSERT 1
            mockClient.query.mockResolvedValueOnce({ rows: [{ dict_id: 2, term: '谢谢', translation: 'Cảm ơn', created_by: 1 }] }); // INSERT 2
            mockClient.query.mockResolvedValueOnce({}); // COMMIT

            const response = await request(app)
                .post('/api/files/upload')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', excelBuffer, 'dict.xlsx');

            expect(response.status).toBe(201);
            expect(response.body.count).toBe(2);
            expect(response.body.entries[0].term).toBe('你好');
            expect(response.body.entries[1].translation).toBe('Cảm ơn');
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
        });

        it('should return 400 if sheet columns are invalid', async () => {
            const excelBuffer = createExcelBuffer([
                ['OnlyOneColumnHeader'],
                ['你好']
            ]);

            const response = await request(app)
                .post('/api/files/upload')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', excelBuffer, 'invalid.xlsx');

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('spreadsheet structure');
        });
    });
});
