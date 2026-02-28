require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testReward(userId, location, amount) {
    console.log(`Testing reward for User: ${userId}, Location: ${location}, Amount: ${amount}`);

    try {
        const userTable = location.toLowerCase() === 'e4' ? 'e4users' : 'e3users';

        // 1. Get current points
        const { data: userBefore, error: err1 } = await supabase
            .from(userTable)
            .select('reward_points')
            .eq('_id', userId)
            .single();

        if (err1) throw new Error(`Fetch before failed: ${err1.message}`);
        console.log(`Points before: ${userBefore.reward_points}`);

        // 2. Apply Reward Logic (simulating what's in payment.js)
        if (amount >= 300 && userId) {
            const currentPoints = Number(userBefore.reward_points) || 0;
            const newPoints = currentPoints + 10;

            const { error: updateError } = await supabase
                .from(userTable)
                .update({ reward_points: newPoints })
                .eq('_id', userId);

            if (updateError) throw new Error(`Update failed: ${updateError.message}`);
            console.log(`Applied +10 points.`);
        } else {
            console.log("No points applied (amount < 300).");
        }

        // 3. Get points after
        const { data: userAfter, error: err2 } = await supabase
            .from(userTable)
            .select('reward_points')
            .eq('_id', userId)
            .single();

        if (err2) throw new Error(`Fetch after failed: ${err2.message}`);
        console.log(`Points after: ${userAfter.reward_points}`);

        if (amount >= 300 && userAfter.reward_points === (userBefore.reward_points || 0) + 10) {
            console.log("✅ Test Passed: Points incremented correctly.");
        } else if (amount < 300 && userAfter.reward_points === userBefore.reward_points) {
            console.log("✅ Test Passed: Points correctly NOT incremented.");
        } else {
            console.log("❌ Test Failed: Points logic incorrect.");
        }

    } catch (err) {
        console.error("Test error:", err.message);
    }
}

// Running tests
async function run() {
    await testReward('521107', 'E3', 350); // Should increment
    // await testReward('521107', 'E3', 100); // Should not increment
}

run();
