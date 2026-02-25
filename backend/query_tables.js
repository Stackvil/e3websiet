require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: e3orders, error: err1 } = await supabase.from('e3orders').select('*').limit(1);
  console.log("e3orders fields:", e3orders ? Object.keys(e3orders[0] || {}) : err1);

  const { data: users, error: err2 } = await supabase.from('users').select('*').limit(1);
  console.log("users fields:", users ? Object.keys(users[0] || {}) : err2);
  
  const { data: analytics, error: err3 } = await supabase.from('analytics').select('*').limit(1);
  console.log("analytics table exists?:", analytics ? 'Yes' : (err3 && err3.message));
}
check();
