const { query } = require('../utils/pgClient');

async function checkTables() {
    try {
        console.log('--- Checking Database Tables ---');
        const res = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        const tables = res.rows.map(row => row.table_name);
        console.log('Existing Tables:', tables);

        const requiredTables = ['users', 'otp_verifications', 'e3orders'];
        const missing = requiredTables.filter(t => !tables.includes(t));

        if (missing.length === 0) {
            console.log('✅ All required tables exist.');
        } else {
            console.warn('❌ Missing tables:', missing);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error checking tables:', err);
        process.exit(1);
    }
}

checkTables();
