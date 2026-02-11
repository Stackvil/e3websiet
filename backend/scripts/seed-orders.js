const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
// const { faker } = require('@faker-js/faker'); // Removed dependency

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const RIDES = [
    { name: 'Roller Coaster', price: 150, id: 'ride-001', type: 'ride' },
    { name: 'Ferris Wheel', price: 100, id: 'ride-002', type: 'ride' },
    { name: 'Bumper Cars', price: 120, id: 'ride-003', type: 'ride' },
    { name: 'Haunted House', price: 200, id: 'ride-004', type: 'ride' },
    { name: 'Carousel', price: 80, id: 'ride-005', type: 'ride' }
];

const EVENTS = [
    { name: 'Magic Show', price: 300, id: 'event-001', stall: 'Events' },
    { name: 'Live Concert', price: 1000, id: 'event-002', stall: 'Events' },
    { name: 'Standup Comedy', price: 500, id: 'event-003', stall: 'Events' }
];

const USERS = [
    { name: 'John Doe', email: 'john@example.com', mobile: '9876543210' },
    { name: 'Jane Smith', email: 'jane@example.com', mobile: '9876543211' },
    { name: 'Mike Ross', email: 'mike@example.com', mobile: '9876543212' },
    { name: 'Rachel Green', email: 'rachel@example.com', mobile: '9876543213' }
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedOrders() {
    console.log('Seeding ~40 orders...');
    const orders = [];

    for (let i = 0; i < 40; i++) {
        const isEvent = Math.random() > 0.6; // 40% events, 60% rides
        const itemTemplate = isEvent ? getRandomItem(EVENTS) : getRandomItem(RIDES);
        const user = getRandomItem(USERS);
        const quantity = Math.floor(Math.random() * 4) + 1;
        const totalAmount = itemTemplate.price * quantity;
        const date = getRandomDate(new Date(2025, 0, 1), new Date());

        const order = {
            _id: `ETH-${Math.floor(100000 + Math.random() * 900000)}`, // Generate random ID like ETH-416988
            txnid: `TXN${Date.now()}${i}`,
            amount: totalAmount,
            firstname: user.name.split(' ')[0],
            email: user.email,
            phone: user.mobile,
            // productinfo: isEvent ? 'Event Booking' : 'Ride Ticket', // Seems missing in schema
            status: 'success',
            // paymentStatus: 'paid', // Missing in schema, relying on status
            createdAt: date.toISOString(),
            items: [
                {
                    id: itemTemplate.id,
                    name: itemTemplate.name,
                    price: itemTemplate.price,
                    quantity: quantity,
                    stall: itemTemplate.stall || null,
                    details: isEvent ? {
                        date: date.toISOString().split('T')[0],
                        startTime: '18:00',
                        endTime: '20:00'
                    } : null
                }
            ],
            // user: { name: user.name, email: user.email } // This might be a relation or jsonb, let's keep it simple or remove if it causes issues. The sample didn't show it.
        };
        orders.push(order);
    }

    const { data, error } = await supabase.from('orders').insert(orders).select();

    if (error) {
        console.error('Error seeding orders:', error);
    } else {
        console.log(`Successfully inserted ${data.length} orders.`);
    }
}

seedOrders();
