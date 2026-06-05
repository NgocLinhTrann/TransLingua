const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDb() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL is not set in .env');
        process.exit(1);
    }

    let targetDbName = 'translingua';
    let defaultClient;

    try {
        const parsedUrl = new URL(dbUrl);
        targetDbName = parsedUrl.pathname.replace('/', '') || 'translingua';
        
        // Connect to default 'postgres' database first to check if target database exists
        parsedUrl.pathname = '/postgres';
        console.log(`Connecting to default "postgres" database to verify "${targetDbName}"...`);
        defaultClient = new Client({ connectionString: parsedUrl.toString() });
        await defaultClient.connect();

        const checkDb = await defaultClient.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [targetDbName]
        );

        if (checkDb.rows.length === 0) {
            console.log(`Database "${targetDbName}" does not exist. Creating it...`);
            await defaultClient.query(`CREATE DATABASE ${targetDbName};`);
            console.log(`Database "${targetDbName}" created successfully.`);
        } else {
            console.log(`Database "${targetDbName}" already exists.`);
        }
    } catch (err) {
        console.error('Error checking/creating database:', err);
        if (defaultClient) await defaultClient.end().catch(() => {});
        process.exit(1);
    } finally {
        if (defaultClient) await defaultClient.end().catch(() => {});
    }

    console.log(`Connecting to "${targetDbName}" database to initialize tables...`);
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('Connected successfully. Initializing tables...');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon to run statements sequentially
        const statements = schemaSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            const tableNameMatch = statement.match(/CREATE\s+TABLE\s+(\w+)/i);
            if (tableNameMatch) {
                const tableName = tableNameMatch[1];
                console.log(`Dropping table ${tableName} if it exists...`);
                await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);
            }
            await client.query(statement);
        }

        console.log('Database tables successfully initialized!');
    } catch (err) {
        console.error('Database initialization error:', err);
    } finally {
        await client.end();
    }
}

initDb();
