require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../utils/pgClient');

async function addRewardsColumn() {
    console.log('--- Adding reward_points column ---');

    const tables = ['users', 'e3users', 'e4users'];

    try {
        for (const table of tables) {
            console.log(`Checking table: ${table}`);

            // Check if column exists
            const checkQuery = `
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1 AND column_name = 'reward_points'
            `;
            const checkRes = await pool.query(checkQuery, [table]);

            if (checkRes.rows.length === 0) {
                console.log(`Adding reward_points to ${table}...`);
                await pool.query(`ALTER TABLE ${table} ADD COLUMN reward_points INTEGER DEFAULT 0`);
                console.log(`Done.`);
            } else {
                console.log(`reward_points column already exists in ${table}.`);
            }
        }

        console.log('--- Migration Complete ---');
        process.exit(0);

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

addRewardsColumn();
