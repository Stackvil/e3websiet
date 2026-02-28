require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSample() {
    try {
        const { data, error } = await supabase
            .from('e3users')
            .select('*')
            .limit(1);

        if (error) throw error;

        if (data && data[0]) {
            console.log("Keys in e3users:", Object.keys(data[0]));
            console.log("Sample User:", data[0]);
        } else {
            console.log("No users found.");
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
}

checkSample();
