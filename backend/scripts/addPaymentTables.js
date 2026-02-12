const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');

const connectionString = (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '').replace('?sslmode=require', '').replace('&sslmode=require', '');

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function addPaymentTables() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        const paymentSchema = `
            _id TEXT PRIMARY KEY,
            "orderId" TEXT,
            amount NUMERIC,
            status TEXT,
            "paymentId" TEXT, -- Gateway ID
            method TEXT,
            "user" TEXT, -- User ID
            location TEXT, -- E3 or E4
            "rawResponse" JSONB,
            "createdAt" TIMESTAMPTZ DEFAULT NOW()
        `;

        const createTable = async (tableName) => {
            const checkQuery = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}')`;
            const res = await client.query(checkQuery);

            if (!res.rows[0].exists) {
                await client.query(`CREATE TABLE ${tableName} (${paymentSchema})`);
                console.log(`Created ${tableName} table`);
            } else {
                console.log(`${tableName} table already exists`);
                // Optional: Verify columns if needed, but for now assumption is if it exists, it's fine or we drop/recreate manually if schema changed significantly.
            }
        };

        await createTable('e3payments');
        await createTable('e4payments');

        console.log('Verified/Created e3payments table');
        console.log('Verified/Created e4payments table');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

addPaymentTables();
