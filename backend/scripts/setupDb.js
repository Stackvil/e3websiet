const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');
const fs = require('fs-extra');


const connectionString = (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '').replace('?sslmode=require', '').replace('&sslmode=require', '');

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const DATA_DIR = path.join(__dirname, '../data');

async function setup() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        // Drop existing tables
        await client.query(`DROP TABLE IF EXISTS "orders" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "products" CASCADE`); // Cleanup old table
        await client.query(`DROP TABLE IF EXISTS "users" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "e3rides" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "e3dines" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "e4rides" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "events" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "sponsors" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "analytics" CASCADE`);
        console.log('Dropped existing tables');

        // Create Users Table
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

        // Helper to create product-like tables
        const createProductTable = async (tableName) => {
            await client.query(`
                CREATE TABLE ${tableName} (
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
            console.log(`Created ${tableName} table`);
        };

        await createProductTable('e3rides');
        await createProductTable('e3dines');
        await createProductTable('e4rides');

        // Create Events Table
        await client.query(`
            CREATE TABLE events (
                _id TEXT PRIMARY KEY,
                name TEXT,
                "start_time" TIMESTAMPTZ,
                "end_time" TIMESTAMPTZ,
                location TEXT,
                price NUMERIC,
                type TEXT,
                status TEXT,
                image TEXT,
                "createdAt" TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('Created events table');

        // Create Orders Table
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

        // Create Sponsors Table
        await client.query(`
            CREATE TABLE sponsors (
                _id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                image TEXT NOT NULL,
                website TEXT,
                tier TEXT,
                "createdAt" TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('Created sponsors table');

        // Create Analytics Table
        await client.query(`
            CREATE TABLE analytics (
                _id TEXT PRIMARY KEY,
                method TEXT,
                path TEXT,
                "statusCode" INTEGER,
                duration INTEGER,
                platform TEXT,
                "userAgent" TEXT,
                timestamp TIMESTAMPTZ,
                "createdAt" TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('Created analytics table');

        // Seed Users
        const users = await fs.readJson(path.join(DATA_DIR, 'User.json'));
        for (const user of users) {
            await client.query(
                `INSERT INTO users (_id, name, email, password, role, mobile, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [user._id, user.name, user.email || '', user.password || '', user.role, user.mobile || null, user.createdAt ? new Date(user.createdAt) : new Date()]
            );
        }
        console.log(`Seeded ${users.length} users`);

        // Helper to seed product-like tables
        const seedProductTable = async (tableName, jsonFile) => {
            if (!await fs.pathExists(path.join(DATA_DIR, jsonFile))) {
                console.log(`Skipping ${tableName}: ${jsonFile} not found`);
                return;
            }
            const items = await fs.readJson(path.join(DATA_DIR, jsonFile));
            for (const p of items) {
                await client.query(
                    `INSERT INTO ${tableName} (_id, name, category, price, "ageGroup", type, status, image, "desc", "isCombo", "comboImages", stall, "menuImages", cuisine, open, "displayId", "createdAt") 
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
            console.log(`Seeded ${items.length} items into ${tableName}`);
        };

        await seedProductTable('e3rides', 'E3Rides.json');
        await seedProductTable('e3dines', 'E3Dine.json');
        await seedProductTable('e4rides', 'E4Rides.json');

        // Seed Events
        if (await fs.pathExists(path.join(DATA_DIR, 'Events.json'))) {
            const events = await fs.readJson(path.join(DATA_DIR, 'Events.json'));
            for (const e of events) {
                await client.query(
                    `INSERT INTO events (_id, name, "start_time", "end_time", location, price, type, status, image, "createdAt") 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        e._id,
                        e.name,
                        e.start_time ? new Date(e.start_time) : null,
                        e.end_time ? new Date(e.end_time) : null,
                        e.location,
                        e.price,
                        e.type,
                        e.status,
                        e.image,
                        e.createdAt ? new Date(e.createdAt) : new Date()
                    ]
                );
            }
            console.log(`Seeded ${events.length} events`);
        }

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
