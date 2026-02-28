require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: e3users, error } = await supabase.from('e3users').select('*').limit(1);
  if (error) {
    console.error("e3users error:", error);
  } else if (e3users && e3users.length > 0) {
    console.log("e3users fields:", Object.keys(e3users[0]));
  } else {
    console.log("e3users table is empty");
  }
}
check();
