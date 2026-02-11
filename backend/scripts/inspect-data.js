const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectData() {
    console.log('--- E3 Rides Sample ---');
    const { data: rides } = await supabase.from('e3rides').select('*').limit(1);
    console.log(JSON.stringify(rides, null, 2));

    console.log('--- E3 Dine Sample ---');
    const { data: dine } = await supabase.from('e3dines').select('*').limit(1);
    console.log(JSON.stringify(dine, null, 2));
}

inspectData();
