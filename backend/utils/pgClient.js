const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars if not already loaded
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '').replace('?sslmode=require', '').replace('&sslmode=require', '');

let pool;
let isMockMode = false;

if (!connectionString) {
    console.warn('WARNING: POSTGRES_URL is missing. Switching to MOCK MODE (In-Memory/File-based).');
    isMockMode = true;
    // Create a dummy pool object to prevent crashes on checks
    pool = {
        query: async () => { console.warn('Mock DB Query - Should be handled by MockModel fallback'); return { rows: [] }; },
        on: () => { },
        connect: async () => { return { release: () => { } } }
    };
} else {
    pool = new Pool({
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
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
    isMockMode
};
