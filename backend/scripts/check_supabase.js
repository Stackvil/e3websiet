const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    try {
        console.log('Fetching tables via SQL RPC...');
        // We can use a direct SQL query through Supabase if we have the permissions
        // Or we can try to list tables by querying information_schema via a raw query if available
        // Since we don't have a direct "list all tables" in supabase-js, we use pg-rest or a known table check

        // Let's try to verify common tables first to show they exist
        const tablesToCheck = [
            'e3users', 'e4users',
            'e3orders', 'e4orders',
            'e3rides', 'e4rides',
            'e3dines', 'e4dines',
            'events', 'e3events', 'e4events',
            'e3bookings', 'e4bookings',
            'e3analytics', 'e4analytics',
            'products', 'sponsors', 'otps',
            'e3payments', 'e4payments'
        ];

        console.log('\n--- Checking Tables Availability ---');
        for (const table of tablesToCheck) {
            const { error } = await supabase.from(table).select('*').limit(0);
            if (!error) {
                console.log(`[EXISTS] ${table}`);
            } else if (error.code === '42P01') {
                console.log(`[MISSING] ${table}`);
            } else {
                console.log(`[ERROR] ${table}: ${error.message}`);
            }
        }
        console.log('------------------------------------\n');

    } catch (err) {
        console.error('Extraction failed:', err.message);
    }
}

listTables();
