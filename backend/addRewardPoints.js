require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL_NON_POOLING + '?sslmode=no-verify',
});

async function addRewardPoints() {
    try {
        console.log("Adding reward_points column to e3users...");
        await pool.query('ALTER TABLE e3users ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;');
        console.log("Successfully added reward_points to e3users.");

        console.log("Adding reward_points column to e4users...");
        await pool.query('ALTER TABLE e4users ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;');
        console.log("Successfully added reward_points to e4users.");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

addRewardPoints();
