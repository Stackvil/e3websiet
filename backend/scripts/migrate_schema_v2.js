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

        const tables = ['e3rides', 'e4rides'];
        for (const table of tables) {
            try {
                await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "isCombo" BOOLEAN DEFAULT FALSE;`);
                console.log(`Added isCombo column to ${table}`);
                await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "rideCount" INTEGER;`);
                console.log(`Added rideCount column to ${table}`);
            } catch (e) {
                console.error(`Error altering ${table}:`, e.message);
            }
        }

        const dineTables = ['e3dines', 'e4dines'];
        for (const table of dineTables) {
            try {
                await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "contactNumber" TEXT;`);
                console.log(`Added contactNumber column to ${table}`);
            } catch (e) {
                console.error(`Error altering ${table}:`, e.message);
            }
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
        console.log('Migration complete.');
    }
}

migrate();
