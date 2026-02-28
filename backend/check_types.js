require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.rpc('get_column_types', { table_name: 'e3users' });
    if (error) {
        // Fallback to manual check of first row values
        const { data: rows } = await supabase.from('e3users').select('*').limit(1);
        if (rows && rows.length > 0) {
            console.log("e3users first row types:");
            for (const key in rows[0]) {
                console.log(`${key}: ${typeof rows[0][key]} (value: ${rows[0][key]})`);
            }
        } else {
            console.error("e3users table is empty or error:", error);
        }
    } else {
        console.log("Column types:", data);
    }
}
check();
