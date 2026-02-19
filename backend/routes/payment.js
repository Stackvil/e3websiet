const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseHelper');
const { validateHash } = require('../utils/easebuzz');

// Helper to get Order Table
const getOrderTable = (location) => {
    return (location || 'e3').toLowerCase() === 'e4' ? 'e4orders' : 'e3orders';
};

// Helper to get Payment Table
const getPaymentTable = (location) => {
    return (location || 'e3').toLowerCase() === 'e4' ? 'e4payments' : 'e3payments';
};

// Helper to record payment
const recordPayment = async (location, data) => {
    try {
        const table = getPaymentTable(location);
        const { error } = await supabase
            .from(table)
            .insert([{
                paymentId: data.easepayid, // Gateway ID
                orderId: data.txnid,
                amount: data.amount,
                status: data.status,
                method: data.mode || 'easebuzz',
                userId: data.udf2 || null, // Sent in checkout
                "createdAt": new Date().toISOString()
            }]);

        if (error) console.error(`Error recording payment for ${data.txnid}:`, error.message);
        else console.log(`Recorded payment for ${location}: ${data.txnid}`);

    } catch (err) {
        console.error(`Failed to record payment for ${location}:`, err);
    }
};

// Handle Success from Easebuzz (POST)
router.post('/success', async (req, res) => {
    try {
        console.log('Payment Success Callback Hit');
        const { status, txnid, udf1, easepayid } = req.body;

        // udf1 contains location (E3 or E4)
        const location = udf1 || 'E3';
        const orderTable = getOrderTable(location);

        // Verify Hash
        const configSalt = require('../utils/easebuzz').getEasebuzzConfig().salt;
        const isValid = validateHash(req.body, configSalt);

        if (isValid) {
            // Update Order Status
            const { error: updateError } = await supabase
                .from(orderTable)
                .update({
                    status: 'success',
                    paymentId: easepayid,
                    txnid: txnid
                })
                .eq('_id', txnid);

            if (updateError) console.error('Order Update Error:', updateError);

            // Record Transaction in Payments Table
            await recordPayment(location, req.body);

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/success?orderId=${txnid}&location=${location}`);
        } else {
            console.error('Hash Validation Failed for txnid:', txnid);
            res.status(400).send('Hash Validation Failed');
        }
    } catch (error) {
        console.error('Payment Success Handler Error:', error);
        res.status(500).send('Internal Error');
    }
});

// Handle Failure from Easebuzz (POST)
router.post('/failure', async (req, res) => {
    try {
        const { txnid, status, udf1 } = req.body;
        const location = udf1 || 'E3';
        const orderTable = getOrderTable(location);

        // Update Order Status
        await supabase
            .from(orderTable)
            .update({ status: status || 'failed' })
            .eq('_id', txnid);

        // Record Transaction
        await recordPayment(location, req.body);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/failed?orderId=${txnid}&location=${location}`);
    } catch (error) {
        console.error('Payment Failure Handler Error:', error);
        res.status(500).send('Internal Error');
    }
});


module.exports = router;
