const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars if not already loaded
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '').replace('?sslmode=require', '').replace('&sslmode=require', '');

if (!connectionString) {
    console.error('FATAL: POSTGRES_URL is missing in environment variables.');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 20, // Max clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
