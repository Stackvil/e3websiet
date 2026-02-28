require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL_NON_POOLING + '?sslmode=no-verify',
});

async function checkSchema() {
    try {
        console.log("--- e3users Schema ---");
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'e3users'
        `);
        console.log(res.rows);

        console.log("\n--- Sample Data ---");
        const data = await pool.query("SELECT * FROM e3users LIMIT 2");
        console.log(data.rows);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
}

checkSchema();
