import 'dotenv/config';
import supabase from './backend/utils/supabaseHelper.js';

async function checkSchema() {
    const { data, error } = await supabase.from('e3orders').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Columns in e3orders:', Object.keys(data[0] || {}));
    }
}

checkSchema();
