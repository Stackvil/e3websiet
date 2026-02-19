const { pool } = require('../utils/pgClient');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS event_bookings (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    event_name VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    guests INTEGER,
    status VARCHAR(50) DEFAULT 'confirmed',
    customer_name VARCHAR(255),
    customer_mobile VARCHAR(50),
    customer_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

const createTable = async () => {
    try {
        console.log('Creating event_bookings table...');
        await pool.query(createTableQuery);
        console.log('Table event_bookings created or already exists.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
};

createTable();
