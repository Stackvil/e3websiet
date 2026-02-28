require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkStatus() {
    console.log("--- Latest Payments ---");
    const { data: payments } = await supabase
        .from('e3payments')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(5);

    payments.forEach(p => {
        console.log(`Payment: ID=${p.paymentId}, Order=${p.orderId}, Amount=${p.amount}, Status=${p.status}, UserID=${p.userId}`);
    });

    console.log("\n--- Users with Points ---");
    const { data: users } = await supabase
        .from('e3users')
        .select('*')
        .gt('reward_points', 0);

    users.forEach(u => {
        console.log(`User: ID=${u._id}, Mobile=${u.mobilenumber}, Points=${u.reward_points}`);
    });
}

checkStatus();
