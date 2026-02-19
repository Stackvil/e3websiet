/**
 * Migration: Add `location` column to `otps` table
 * Run once: node backend/scripts/migrate_otps_location.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');

const connectionString = (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '')
    .replace('?sslmode=require', '')
    .replace('&sslmode=require', '');

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');

    try {
        // Add column if it doesn't already exist
        await client.query(`
            ALTER TABLE otps
            ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'E3';
        `);
        console.log('✅  Column `location` added to `otps` table (or already existed).');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
