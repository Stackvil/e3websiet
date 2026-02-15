const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');

const connectionString = (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '').replace('?sslmode=require', '').replace('&sslmode=require', '');

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function createOtpTable() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        // Create OTP Verifications Table
        console.log('Creating otp_verifications table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS otp_verifications (
                mobile TEXT PRIMARY KEY,
                otp TEXT NOT NULL,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ Created otp_verifications table');

        // Add index for faster expiry checks
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_otp_expires 
            ON otp_verifications(expires_at);
        `);
        console.log('✅ Created index on expires_at');

        // Ensure user tables have mobile field (should already exist, but adding for safety)
        const userTables = ['users', 'e3users', 'e4users'];

        for (const table of userTables) {
            // Check if mobile column exists
            const checkColumn = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1 AND column_name = 'mobile';
            `, [table]);

            if (checkColumn.rows.length === 0) {
                console.log(`Adding mobile column to ${table}...`);
                await client.query(`
                    ALTER TABLE "${table}" 
                    ADD COLUMN mobile TEXT;
                `);
                console.log(`✅ Added mobile column to ${table}`);
            } else {
                console.log(`✓ Mobile column already exists in ${table}`);
            }

            // Add unique constraint on mobile (optional, but recommended)
            try {
                await client.query(`
                    CREATE UNIQUE INDEX IF NOT EXISTS idx_${table}_mobile 
                    ON "${table}"(mobile) 
                    WHERE mobile IS NOT NULL;
                `);
                console.log(`✅ Created unique index on ${table}.mobile`);
            } catch (err) {
                console.log(`Note: Unique index on ${table}.mobile may already exist`);
            }
        }

        // Make password optional (allow NULL for OTP-only users)
        for (const table of userTables) {
            console.log(`Ensuring password is nullable in ${table}...`);
            await client.query(`
                ALTER TABLE "${table}" 
                ALTER COLUMN password DROP NOT NULL;
            `);
            console.log(`✅ Password is now nullable in ${table}`);
        }

        console.log('\n🎉 Database migration completed successfully!');
        console.log('\nSummary:');
        console.log('- Created otp_verifications table');
        console.log('- Ensured mobile field exists in all user tables');
        console.log('- Added unique constraints on mobile numbers');
        console.log('- Made password field optional (nullable)');

    } catch (err) {
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        await client.end();
    }
}

createOtpTable();
