const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const supabase = require('./utils/supabaseHelper');

async function check() {
    const { data, error } = await supabase.from('e3rides').select('*').limit(1);
    console.log(error || data);
}
check();
