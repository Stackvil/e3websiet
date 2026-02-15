require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../utils/pgClient');

async function inspect() {
    try {
        console.log('--- Inspecting event_bookings ---');
        const res = await pool.query('SELECT * FROM event_bookings LIMIT 1');
        if (res.rows.length === 0) {
            console.log('Table is empty. Checking columns via information_schema...');
            const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'event_bookings'");
            console.log('Columns:', cols.rows.map(r => r.column_name));
        } else {
            console.log('Sample Row:', res.rows[0]);
            console.log('Columns:', Object.keys(res.rows[0]));
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

inspect();
