const { param } = require('express/lib/request');
const { query } = require('../utils/pgClient');

async function checkUsers() {
    try {
        console.log('--- Checking Users Table ---');
        const res = await query('SELECT COUNT(*) FROM users');
        console.log('User Count:', res.rows[0].count);

        if (parseInt(res.rows[0].count) > 0) {
            const sample = await query('SELECT * FROM users LIMIT 1');
            console.log('Sample User:', sample.rows[0]);
        } else {
            console.log('Table is empty.');
        }

        // Also check e3users just in case
        const resE3 = await query('SELECT COUNT(*) FROM e3users');
        console.log('E3User Count:', resE3.rows[0].count);

        process.exit(0);
    } catch (err) {
        console.error('Error checking users:', err);
        process.exit(1);
    }
}

checkUsers();
