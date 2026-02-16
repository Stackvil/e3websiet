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

        // Add 'images' column to e3rides
        try {
            await client.query(`ALTER TABLE e3rides ADD COLUMN IF NOT EXISTS images JSONB;`);
            console.log('Added images column to e3rides');
        } catch (e) {
            console.error('Error altering e3rides:', e.message);
        }

        // Add 'images' column to e4rides
        try {
            await client.query(`ALTER TABLE e4rides ADD COLUMN IF NOT EXISTS images JSONB;`);
            console.log('Added images column to e4rides');
        } catch (e) {
            console.error('Error altering e4rides:', e.message);
        }

        // Add 'menuImages' column to e3dines (if not exists already, usually it is JSONB but validating)
        try {
            await client.query(`ALTER TABLE e3dines ADD COLUMN IF NOT EXISTS "menuImages" JSONB;`);
            console.log('Added menuImages column to e3dines');
        } catch (e) {
            console.error('Error altering e3dines:', e.message);
        }

        // Add 'menuImages' column to e4dines
        try {
            await client.query(`ALTER TABLE e4dines ADD COLUMN IF NOT EXISTS "menuImages" JSONB;`);
            console.log('Added menuImages column to e4dines');
        } catch (e) {
            console.error('Error altering e4dines:', e.message);
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
        console.log('Migration complete.');
    }
}

migrate();
