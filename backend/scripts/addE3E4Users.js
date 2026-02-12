const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');

const connectionString = (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '').replace('?sslmode=require', '').replace('&sslmode=require', '');

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function addE3E4Users() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        const createUserTable = async (tableName) => {
            await client.query(`
                CREATE TABLE IF NOT EXISTS ${tableName} (
                    _id TEXT PRIMARY KEY,
                    name TEXT,
                    email TEXT,
                    password TEXT,
                    role TEXT,
                    mobile TEXT,
                    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
            `);
            console.log(`Verified/Created ${tableName} table`);
        };

        await createUserTable('e3users');
        await createUserTable('e4users');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

addE3E4Users();
