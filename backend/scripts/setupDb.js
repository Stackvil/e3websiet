const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');
const fs = require('fs-extra');


const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

const DATA_DIR = path.join(__dirname, '../data');

async function setup() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        // Drop existing tables
        await client.query(`DROP TABLE IF EXISTS "orders" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "products" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "users" CASCADE`);
        console.log('Dropped existing tables');

        // Create Users Table
        // json: { name, email, password, role, _id, mobile, createdAt }
        await client.query(`
            CREATE TABLE users (
                _id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT,
                password TEXT,
                role TEXT,
                mobile TEXT,
                "createdAt" TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('Created users table');

        // Create Products Table
        // json: { name, category, price, ageGroup, type, status, image, desc, isCombo, comboImages, _id, stall, menuImages, cuisine, open, displayId }
        await client.query(`
            CREATE TABLE products (
                _id TEXT PRIMARY KEY,
                name TEXT,
                category TEXT,
                price NUMERIC,
                "ageGroup" TEXT,
                type TEXT,
                status TEXT,
                image TEXT,
                "desc" TEXT,
                "isCombo" BOOLEAN,
                "comboImages" JSONB,
                stall TEXT,
                "menuImages" JSONB,
                cuisine TEXT,
                open BOOLEAN,
                "displayId" INTEGER,
                "createdAt" TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('Created products table');

        // Create Orders Table
        // json: { _id, txnid, amount, firstname, email, phone, items, status, createdAt, paymentId }
        await client.query(`
            CREATE TABLE orders (
                _id TEXT PRIMARY KEY,
                txnid TEXT,
                amount NUMERIC,
                firstname TEXT,
                email TEXT,
                phone TEXT,
                items JSONB,
                status TEXT,
                "paymentId" TEXT,
                "createdAt" TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('Created orders table');

        // Seed Users
        const users = await fs.readJson(path.join(DATA_DIR, 'User.json'));
        for (const user of users) {
            await client.query(
                `INSERT INTO users (_id, name, email, password, role, mobile, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [user._id, user.name, user.email || '', user.password || '', user.role, user.mobile || null, user.createdAt ? new Date(user.createdAt) : new Date()]
            );
        }
        console.log(`Seeded ${users.length} users`);

        // Seed Products
        const products = await fs.readJson(path.join(DATA_DIR, 'Product.json'));
        for (const p of products) {
            await client.query(
                `INSERT INTO products (_id, name, category, price, "ageGroup", type, status, image, "desc", "isCombo", "comboImages", stall, "menuImages", cuisine, open, "displayId", "createdAt") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
                [
                    p._id,
                    p.name,
                    p.category,
                    p.price,
                    p.ageGroup,
                    p.type,
                    p.status,
                    p.image,
                    p.desc,
                    p.isCombo || false,
                    JSON.stringify(p.comboImages || []),
                    p.stall,
                    JSON.stringify(p.menuImages || []),
                    p.cuisine,
                    p.open !== undefined ? p.open : true,
                    p.displayId || null,
                    p.createdAt ? new Date(p.createdAt) : new Date()
                ]
            );
        }
        console.log(`Seeded ${products.length} products`);

        // Seed Orders
        const orders = await fs.readJson(path.join(DATA_DIR, 'Order.json'));
        for (const o of orders) {
            await client.query(
                `INSERT INTO orders (_id, txnid, amount, firstname, email, phone, items, status, "paymentId", "createdAt") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    o._id,
                    o.txnid || o._id,
                    o.amount,
                    o.firstname,
                    o.email,
                    o.phone,
                    JSON.stringify(o.items || []),
                    o.status,
                    o.paymentId,
                    o.createdAt ? new Date(o.createdAt) : new Date()
                ]
            );
        }
        console.log(`Seeded ${orders.length} orders`);

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        await client.end();
    }
}

setup();
