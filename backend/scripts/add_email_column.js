const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');

const connectionString = (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '').replace('?sslmode=require', '').replace('&sslmode=require', '');

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        // Add 'email' column to e3users
        try {
            await client.query(`ALTER TABLE e3users ADD COLUMN IF NOT EXISTS email TEXT;`);
            console.log('Added email column to e3users');
        } catch (e) {
            console.error('Error altering e3users:', e.message);
        }

        // Add 'email' column to e4users
        try {
            await client.query(`ALTER TABLE e4users ADD COLUMN IF NOT EXISTS email TEXT;`);
            console.log('Added email column to e4users');
        } catch (e) {
            console.error('Error altering e4users:', e.message);
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
        console.log('Migration complete.');
    }
}

migrate();
