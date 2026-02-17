const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');
const fs = require('fs-extra');
const { createClient } = require('@supabase/supabase-js');

// Simple mime type mapper if package not available
const getMimeType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.avif': 'image/avif'
    };
    return map[ext] || 'application/octet-stream';
};

const connectionString = (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '').replace('?sslmode=require', '').replace('&sslmode=require', '');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME;
if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const PUBLIC_DIR = path.join(__dirname, '../../public');

async function uploadImagesRec(dir, baseDir = '') {
    const files = await fs.readdir(dir);
    let uploadedCount = 0;

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
            uploadedCount += await uploadImagesRec(filePath, path.join(baseDir, file));
        } else {
            if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.avif'].includes(path.extname(file).toLowerCase())) {
                const fileBuffer = await fs.readFile(filePath);
                const contentType = getMimeType(filePath);
                // Ensure forward slashes and do not encode here, Supabase upload handles path as key
                const storagePath = path.join(baseDir, file).replace(/\\/g, '/');

                // Upload
                const { error } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(storagePath, fileBuffer, {
                        contentType,
                        upsert: true
                    });

                if (error) {
                    console.error(`Failed to upload ${storagePath}:`, error.message);
                } else {
                    uploadedCount++;
                }
            }
        }
    }
    return uploadedCount;
}

async function setup() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        // --- 1. DROP EXISTING TABLES ---
        const tablesToDrop = [
            'users', 'e3users', 'e4users',
            'orders', 'e3orders', 'e4orders',
            'e3rides', 'e4rides',
            'e3dines', 'e4dines',
            'events', 'e3events', 'e4events',
            'analytics', 'e3analytics', 'e4analytics',
            'sponsors', 'products', 'otps',
            'e3payments', 'e4payments' // Added payments tables to drop list
        ];

        for (const table of tablesToDrop) {
            await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        }
        console.log('Dropped all existing tables.');


        // --- 2. UPLOAD IMAGES ---
        console.log(`Starting image upload to bucket '${BUCKET_NAME}'...`);
        if (await fs.pathExists(PUBLIC_DIR)) {
            try {
                // Check if bucket exists, create if not
                const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
                if (!bucketError && !buckets.find(b => b.name === BUCKET_NAME)) {
                    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, { public: true });
                    if (createError) console.error('Error creating bucket:', createError.message);
                    else console.log(`Created bucket: ${BUCKET_NAME}`);
                }

                const count = await uploadImagesRec(PUBLIC_DIR);
                console.log(`Uploaded ${count} images to Supabase Storage.`);
            } catch (err) {
                console.error('Error during image upload:', err);
            }
        } else {
            console.log('Public directory not found, skipping image upload.');
        }


        // --- 3. DEFINE SCHEMA ---

        // User Table: name, mobilenumber, email
        const createUserTable = async (tableName) => {
            await client.query(`
                CREATE TABLE ${tableName} (
                    _id TEXT PRIMARY KEY,
                    name TEXT,
                    mobilenumber TEXT UNIQUE,
                    email TEXT,
                    role TEXT DEFAULT 'user',
                    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
            `);
            console.log(`Created ${tableName} table`);
        };

        const createOtpTable = async () => {
            await client.query(`
                CREATE TABLE otps (
                    mobile TEXT PRIMARY KEY,
                    otp TEXT NOT NULL,
                    "expiresAt" TIMESTAMPTZ NOT NULL,
                    "createdAt" TIMESTAMPTZ DEFAULT NOW()
                );
            `);
            console.log(`Created otps table`);
        };

        // Rides Table
        const createRideTable = async (tableName) => {
            await client.query(`
                CREATE TABLE ${tableName} (
                    _id TEXT PRIMARY KEY,
                    name TEXT,
                    price NUMERIC,
                    image TEXT,
                    images JSONB,
                    "desc" TEXT,
                    category TEXT,
                    "ageGroup" TEXT,
                    type TEXT,
                    status TEXT,
                    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
            `);
            console.log(`Created ${tableName} table`);
        };

        // Dines Table
        const createDineTable = async (tableName) => {
            await client.query(`
                CREATE TABLE ${tableName} (
                    _id TEXT PRIMARY KEY,
                    name TEXT,
                    price NUMERIC,
                    image TEXT,
                    category TEXT,
                    cuisine TEXT,
                    stall TEXT,
                    open BOOLEAN,
                    status TEXT,
                    "menuImages" JSONB,
                    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
            `);
            console.log(`Created ${tableName} table`);
        };

        // Events Table
        const createEventTable = async (tableName) => {
            await client.query(`
                CREATE TABLE ${tableName} (
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
            console.log(`Created ${tableName} table`);
        };

        // Orders Table
        const createOrderTable = async (tableName) => {
            await client.query(`
                CREATE TABLE ${tableName} (
                    _id TEXT PRIMARY KEY,
                    amount NUMERIC,
                    items JSONB,
                    status TEXT,
                    "userId" TEXT,
                    "paymentId" TEXT,
                    "txnid" TEXT,
                    "createdAt" TIMESTAMPTZ DEFAULT NOW()
                );
            `);
            console.log(`Created ${tableName} table`);
        };

        // Payment Table (Separate tables for E3/E4)
        const createPaymentTable = async (tableName) => {
            await client.query(`
                CREATE TABLE ${tableName} (
                    _id TEXT PRIMARY KEY,
                    "orderId" TEXT,
                    amount NUMERIC,
                    status TEXT,
                    "paymentId" TEXT, -- Gateway Transaction ID
                    method TEXT,      -- e.g., 'upi', 'card'
                    "userId" TEXT,
                    "createdAt" TIMESTAMPTZ DEFAULT NOW()
                );
            `);
            console.log(`Created ${tableName} table`);
        };

        // Analytics
        const createAnalyticsTable = async (tableName) => {
            await client.query(`
                CREATE TABLE ${tableName} (
                    _id TEXT PRIMARY KEY,
                    method TEXT,
                    path TEXT,
                    "statusCode" INTEGER,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                );
            `);
            console.log(`Created ${tableName} table`);
        };

        // Create Tables
        await createUserTable('e3users');
        await createUserTable('e4users');
        await createOtpTable();
        await createRideTable('e3rides');
        await createRideTable('e4rides');
        await createDineTable('e3dines');
        await createDineTable('e4dines');
        await createEventTable('e3events');
        await createEventTable('e4events');
        await createOrderTable('e3orders');
        await createOrderTable('e4orders');
        await createPaymentTable('e3payments'); // New
        await createPaymentTable('e4payments'); // New
        await createAnalyticsTable('e3analytics');
        await createAnalyticsTable('e4analytics');


        // --- 4. SEED DATA ---

        const PRODUCTS_FILE = path.join(__dirname, '../../src/data/products.json');
        const USERS_FILE = path.join(__dirname, '../data/e3users.json');

        // Helper to transform local path to Supabase URL
        const getPublicUrl = (localPath) => {
            if (!localPath) return '';
            if (localPath.startsWith('http')) return localPath; // Already remote

            // Remove leading slash
            const cleanPath = localPath.replace(/^\//, '');

            // Encode the path properly:
            // "bumping cars single/IMG_8417.jpg" -> "bumping%20cars%20single/IMG_8417.jpg"
            const encodedPath = cleanPath.split('/').map(part => encodeURIComponent(part)).join('/');

            return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${encodedPath}`;
        };

        // Seed Users
        if (await fs.pathExists(USERS_FILE)) {
            const users = await fs.readJson(USERS_FILE);
            for (const user of users) {
                try {
                    await client.query(
                        `INSERT INTO e3users (_id, name, mobilenumber, email, role, "createdAt")
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [
                            user._id,
                            user.name,
                            user.mobile || user.mobilenumber || '',
                            user.email || '',
                            user.role,
                            user.createdAt ? new Date(user.createdAt) : new Date()
                        ]
                    );
                } catch (e) {
                    console.error('Error seeding user:', e.message);
                }
            }
            console.log(`Seeded ${users.length} users into e3users`);
        }


        // Seed Products
        if (await fs.pathExists(PRODUCTS_FILE)) {
            const products = await fs.readJson(PRODUCTS_FILE);

            let ridesCount = 0;
            let dinesCount = 0;
            let eventsCount = 0;

            for (const item of products) {
                try {
                    // TRANSFORM IMAGES
                    const imageUrl = getPublicUrl(item.image);
                    const menuImages = (item.menuImages || []).map(img => getPublicUrl(img));
                    const comboImages = (item.comboImages || []).map(img => getPublicUrl(img));

                    // Use comboImages as default for 'images' gallery if present
                    const images = (item.images || comboImages || []).map(img => img.startsWith('http') ? img : getPublicUrl(img));

                    if (item.category === 'play' || (item.category === 'play' && item.isCombo)) {
                        try {
                            // Seed e3rides
                            await client.query(
                                `INSERT INTO e3rides (_id, name, price, image, images, "desc", category, "ageGroup", type, status, "createdAt") 
                                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                                [
                                    item._id, item.name, item.price, imageUrl, JSON.stringify(images), item.desc,
                                    item.category, item.ageGroup, item.type, item.status || 'on',
                                    item.createdAt ? new Date(item.createdAt) : new Date()
                                ]
                            );
                            ridesCount++;

                            // Seed e4rides (Duplicate Data)
                            try {
                                await client.query(
                                    `INSERT INTO e4rides (_id, name, price, image, images, "desc", category, "ageGroup", type, status, "createdAt") 
                                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                                    [
                                        item._id, item.name, item.price, imageUrl, JSON.stringify(images), item.desc,
                                        item.category, item.ageGroup, item.type, item.status || 'on',
                                        item.createdAt ? new Date(item.createdAt) : new Date()
                                    ]
                                );
                            } catch (e4Err) {
                                if (!e4Err.message.includes('duplicate key')) throw e4Err;
                            }

                        } catch (err) {
                            if (!err.message.includes('duplicate key')) throw err;
                        }
                    }

                    if (item.category === 'dine') {
                        try {
                            await client.query(
                                `INSERT INTO e3dines (_id, name, price, image, category, cuisine, stall, open, status, "menuImages", "createdAt") 
                                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                                [
                                    item._id, item.name, item.price, imageUrl, item.category,
                                    item.cuisine, item.stall, item.open !== undefined ? item.open : true,
                                    item.status || 'on', JSON.stringify(menuImages),
                                    item.createdAt ? new Date(item.createdAt) : new Date()
                                ]
                            );

                            // Seed e4dines (Duplicate Data for now if needed, but request specified rides)
                            // Let's duplicate dine items too for consistency if e4 mimics e3
                            try {
                                await client.query(
                                    `INSERT INTO e4dines (_id, name, price, image, category, cuisine, stall, open, status, "menuImages", "createdAt") 
                                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                                    [
                                        item._id, item.name, item.price, imageUrl, item.category,
                                        item.cuisine, item.stall, item.open !== undefined ? item.open : true,
                                        item.status || 'on', JSON.stringify(menuImages),
                                        item.createdAt ? new Date(item.createdAt) : new Date()
                                    ]
                                );
                            } catch (e4DineErr) {
                                if (!e4DineErr.message.includes('duplicate key')) throw e4DineErr;
                            }

                            dinesCount++;
                        } catch (err) {
                            if (!err.message.includes('duplicate key')) throw err;
                        }
                    }

                    if (item.category === 'event') {
                        try {
                            await client.query(
                                `INSERT INTO e3events (_id, name, "start_time", "end_time", location, price, type, status, image, "createdAt")
                                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                                [
                                    item._id, item.name,
                                    item.start_time ? new Date(item.start_time) : null,
                                    item.end_time ? new Date(item.end_time) : null,
                                    item.location, item.price, item.type, item.status, imageUrl,
                                    item.createdAt ? new Date(item.createdAt) : new Date()
                                ]
                            );

                            // Seed e4events
                            try {
                                await client.query(
                                    `INSERT INTO e4events (_id, name, "start_time", "end_time", location, price, type, status, image, "createdAt")
                                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                                    [
                                        item._id, item.name,
                                        item.start_time ? new Date(item.start_time) : null,
                                        item.end_time ? new Date(item.end_time) : null,
                                        item.location, item.price, item.type, item.status, imageUrl,
                                        item.createdAt ? new Date(item.createdAt) : new Date()
                                    ]
                                );
                            } catch (e4EventErr) {
                                if (!e4EventErr.message.includes('duplicate key')) throw e4EventErr;
                            }

                            eventsCount++;
                        } catch (err) {
                            if (!err.message.includes('duplicate key')) throw err;
                        }
                    }
                } catch (e) {
                    console.error(`Error seeding product ${item._id}:`, e.message);
                }
            }
            console.log(`Seeded ${ridesCount} rides, ${dinesCount} dine items, ${eventsCount} events into E3 and E4 tables.`);

        } else {
            console.log('Skipping Product seed: src/data/products.json not found');
        }

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        await client.end();
    }
}

setup();
