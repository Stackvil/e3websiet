const supabase = require('./utils/supabaseHelper');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
async function check() {
    const { data } = await supabase.from('e3dines').select('menuImages');
    let hasNull = false;
    for (let d of data) {
        if (d.menuImages && d.menuImages.some(img => img === null || img === undefined)) {
            console.log('Found null in', d);
            hasNull = true;
        }
    }
    console.log('Has null?', hasNull);
}
check();
