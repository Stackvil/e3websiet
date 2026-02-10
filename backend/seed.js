const dotenv = require('dotenv');
const MockModel = require('./utils/mockDB');
const bcrypt = require('bcryptjs');

dotenv.config();

const Product = new MockModel('Product');
const User = new MockModel('User');

const products = [
    // Food
    { name: 'Chicken Mandi', category: 'food', price: 450, stall: 'Darbar Mandi', type: 'mandi', status: 'on', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80' },
    { name: 'Steamed Momo', category: 'food', price: 180, stall: 'Wow! Momo', type: 'momo', status: 'on', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80' },
    // Play
    { name: 'Bumping Cars Ticket', category: 'play', price: 150, type: 'ride', status: 'on', image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Indoor Cricket Slot', category: 'play', price: 500, type: 'sports', status: 'on', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80' },
    // Events
    { name: 'VIP Dining Suite', category: 'event', price: 2000, type: 'hall', status: 'on', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80' },
];

const seedDB = async () => {
    try {
        console.log('Seeding Mock DB...');

        await Product.deleteMany({});
        await Product.insertMany(products);

        // Create Default Admin
        const adminEmail = 'admin@ethree.com';
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                name: 'Ethree Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user created');
        }

        console.log('Mock Database Seeded Successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
