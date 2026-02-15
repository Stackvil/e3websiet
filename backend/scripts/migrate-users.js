require('dotenv').config();
const { query } = require('../utils/pgClient');

async function migrateUsers() {
    console.log('--- Migrating Users to E3Users ---');

    try {
        // 1. Fetch all users from 'users' table
        const { rows: users } = await query('SELECT * FROM users');
        console.log(`Found ${users.length} users to migrate.`);

        if (users.length === 0) {
            console.log('No users found in users table.');
            process.exit(0);
        }

        let migratedCount = 0;
        let skippedCount = 0;

        for (const user of users) {
            // Check if user already exists in e3users (by mobile preferably, or email)
            // Note: 'users' table might have inconsistent fields, so we need to be careful.

            const mobile = user.mobile || '';
            const email = user.email || '';

            // Skip if no identifier
            if (!mobile && !email) {
                console.log(`Skipping user ID ${user._id} - No mobile or email.`);
                continue;
            }

            // Check existence in e3users
            let existing = null;
            if (mobile) {
                const res = await query('SELECT * FROM e3users WHERE mobile = $1', [mobile]);
                existing = res.rows[0];
            } else if (email) {
                const res = await query('SELECT * FROM e3users WHERE email = $1', [email]);
                existing = res.rows[0];
            }

            if (existing) {
                console.log(`User ${user.name} (${mobile || email}) already exists in e3users. Skipping.`);
                skippedCount++;
                continue;
            }

            // Insert into e3users
            // Map fields: users table cols -> e3users table cols
            // Assuming they are similar based on previous inspection
            const insertQuery = `
                INSERT INTO e3users (_id, name, mobile, email, password, role)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;

            await query(insertQuery, [
                user._id, // Keep same ID
                user.name || 'User',
                user.mobile || '',
                user.email || '',
                user.password || '', // Could be plain text or hash
                user.role || 'customer'
            ]);

            console.log(`Migrated user: ${user.name}`);
            migratedCount++;
        }

        console.log('--- Migration Complete ---');
        console.log(`Migrated: ${migratedCount}`);
        console.log(`Skipped: ${skippedCount}`);

        process.exit(0);

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateUsers();
