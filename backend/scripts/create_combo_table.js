const db = require('../utils/pgClient');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS "e3comborides" (
    "_id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" NUMERIC,
    "image" TEXT,
    "desc" TEXT,
    "images" JSONB DEFAULT '[]',
    "rideCount" INTEGER,
    "isCombo" BOOLEAN DEFAULT TRUE,
    "status" TEXT,
    "category" TEXT,
    "type" TEXT,
    "ageGroup" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`;

(async () => {
    try {
        console.log('Creating table e3comborides...');
        await db.query(createTableQuery);
        console.log('Table e3comborides created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
})();
