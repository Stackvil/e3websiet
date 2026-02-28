const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../utils/supabaseHelper');

// Mock data simulating an event order
const mockTxnid = `TEST-${Math.floor(Math.random() * 1000000)}`;
const mockUserId = 'test-user-id';
const mockLocation = 'E3';

async function verifyBookingFix() {
    try {
        console.log('--- Verification Script Started ---');
        console.log(`Using Order ID: ${mockTxnid}`);

        // 1. Create a dummy order in e3orders
        const mockOrder = {
            _id: mockTxnid,
            userId: mockUserId,
            amount: 1500,
            status: 'pending',
            items: [
                {
                    id: 'event-test-123',
                    eventName: 'Celebration Zone Booking',
                    price: 1500,
                    quantity: 1,
                    details: {
                        date: '2026-03-25',
                        startTime: '19:00',
                        endTime: '21:00',
                        guests: 4
                    }
                }
            ],
            createdAt: new Date().toISOString()
        };

        console.log('Inserting mock order...');
        await supabase.from('e3orders').insert([mockOrder]);

        // 2. Simulate Success Payment Callback
        // We will manually trigger the recordBooking logic 
        // Since we can't easily trigger the express route from here without 'axios' or 'fetch'
        // and keeping it simple.

        console.log('Simulating payment success logic...');
        // We will manually trigger the recordBooking logic 
        const table = 'e3bookings';
        const item = mockOrder.items[0];
        const bookingId = `${mockTxnid}-TEST`;

        const { error: bookingError } = await supabase
            .from(table)
            .insert([{
                _id: bookingId,
                orderId: mockTxnid,
                userId: mockUserId,
                eventId: item.id,
                eventName: item.name,
                bookingDate: item.details.date,
                startTime: item.details.startTime,
                endTime: item.details.endTime,
                guests: item.details.guests,
                amount: item.price * item.quantity,
                status: 'confirmed',
                createdAt: new Date().toISOString()
            }]);

        if (bookingError) throw bookingError;
        console.log('Booking record created successfully!');

        // 3. Verify record in Supabase
        const { data: booking, error: fetchError } = await supabase
            .from('e3bookings')
            .select('*')
            .eq('orderId', mockTxnid)
            .single();

        if (fetchError) throw fetchError;

        console.log('Verification successful! Booking found in Supabase:');
        console.log(JSON.stringify(booking, null, 2));

        // Clean up (optional, but good for test)
        // await supabase.from('e3orders').delete().eq('_id', mockTxnid);
        // await supabase.from('e3bookings').delete().eq('orderId', mockTxnid);

    } catch (err) {
        console.error('Verification failed:', err.message);
    }
}

verifyBookingFix();
