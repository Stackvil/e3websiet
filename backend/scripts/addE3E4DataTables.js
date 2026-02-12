const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');

const connectionString = (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '').replace('?sslmode=require', '').replace('&sslmode=require', '');

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function addE3E4DataTables() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        const createTable = async (tableName, schemaQuery) => {
            await client.query(`
                CREATE TABLE IF NOT EXISTS ${tableName} (
                    ${schemaQuery}
                );
            `);
            console.log(`Verified/Created ${tableName} table`);
        };

        const ordersSchema = `
            _id TEXT PRIMARY KEY,
            txnid TEXT,
            amount NUMERIC,
            firstname TEXT,
            email TEXT,
            phone TEXT,
            items JSONB,
            status TEXT,
            "paymentId" TEXT,
            location TEXT,
            "paymentMethod" TEXT,
            "paymentStatus" TEXT,
            "orderStatus" TEXT,
            "createdAt" TIMESTAMPTZ DEFAULT NOW(),
            "user" TEXT -- Adding user reference for completeness though often in items or separate
        `;

        const analyticsSchema = `
            _id TEXT PRIMARY KEY,
            method TEXT,
            path TEXT,
            "statusCode" INTEGER,
            duration INTEGER,
            platform TEXT,
            "userAgent" TEXT,
            timestamp TIMESTAMPTZ,
            "createdAt" TIMESTAMPTZ DEFAULT NOW()
        `;

        await createTable('e3orders', ordersSchema);
        await createTable('e4orders', ordersSchema);
        await createTable('e3analytics', analyticsSchema);
        await createTable('e4analytics', analyticsSchema);

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

addE3E4DataTables();
