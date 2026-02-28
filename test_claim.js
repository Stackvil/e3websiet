import 'dotenv/config';
import supabase from './backend/utils/supabaseHelper.js';

async function testClaim() {
    const userId = '238802'; // Sample ID
    console.log(`Testing reward claim for user: ${userId}`);

    try {
        // 1. Ensure user has 500+ points
        console.log('Step 1: Setting user points to 550...');
        const { error: setErr } = await supabase
            .from('e3users')
            .update({ reward_points: 550 })
            .eq('_id', userId);

        if (setErr) throw setErr;

        // 2. Simulate Claim Logic
        console.log('Step 2: Simulating claim logic...');
        const { data: user, error: fetchErr } = await supabase
            .from('e3users')
            .select('reward_points')
            .eq('_id', userId)
            .single();

        if (fetchErr) throw fetchErr;
        console.log(`Current Points: ${user.reward_points}`);

        if (user.reward_points >= 500) {
            // Deduct
            const { error: deductErr } = await supabase
                .from('e3users')
                .update({ reward_points: user.reward_points - 500 })
                .eq('_id', userId);

            if (deductErr) throw deductErr;
            console.log('Points deducted successfully.');

            // Insert Order
            const txnid = 'TEST-REW-' + Date.now();
            const { error: orderErr } = await supabase
                .from('e3orders')
                .insert([{
                    _id: txnid,
                    userId: userId,
                    items: [{ id: 'reward-free-ride', name: 'Free Ride Ticket (Reward)', price: 0, quantity: 1, stall: 'Rewards' }],
                    amount: 0,
                    status: 'success',
                    createdAt: new Date().toISOString()
                }]);

            if (orderErr) throw orderErr;
            console.log(`Test order created: ${txnid}`);
        }

        // 3. Verify final state
        const { data: finalUser } = await supabase
            .from('e3users')
            .select('reward_points')
            .eq('_id', userId)
            .single();

        console.log(`Final Points (should be 50): ${finalUser.reward_points}`);

        if (finalUser.reward_points === 50) {
            console.log('✅ TEST PASSED');
        } else {
            console.log('❌ TEST FAILED');
        }

    } catch (err) {
        console.error('Test failed with error:', err);
    }
}

testClaim();
