const db = require('./pgClient');
const fs = require('fs-extra');
const path = require('path');

class MockModel {
    constructor(name) {
        this.name = name;
        // Map model names to table names
        const tableMappings = {
            'user': 'users',
            'order': 'orders',
            'e3order': 'e3orders',
            'e4order': 'e4orders',
            'e3ride': 'e3rides',
            'e3dine': 'e3dines',
            'e4ride': 'e4rides',
            'e4dine': 'e4dines', // if exists
            'event': 'events',
            'sponsor': 'sponsors',
            'analytics': 'analytics',
            'booking': 'bookings',
            'e3user': 'e3users',
            'e4user': 'e4users',
            'e3analytics': 'e3analytics',
            'e4analytics': 'e4analytics',
            'e3payment': 'e3payments',
            'e4payment': 'e4payments',
            'e3comboride': 'e3comborides',
            'product': 'products'
        };

        // File mappings for mock mode (Table Name -> File Name)
        this.fileMappings = {
            'users': 'User.json',
            'orders': 'Order.json',
            'events': 'Events.json',
            'bookings': 'Booking.json',
            'products': 'Products.json',
            'e3dines': 'E3Dine.json',
            'e3rides': 'E3Rides.json',
            'e4rides': 'E4Rides.json'
        };

        const lowerName = name.toLowerCase();
        this.table = tableMappings[lowerName] || lowerName + 's';
        this.dataPath = path.join(__dirname, '../data', this.fileMappings[this.table] || `${this.table}.json`);
    }

    // Helper to read data from file
    async _readData() {
        try {
            if (await fs.pathExists(this.dataPath)) {
                return await fs.readJson(this.dataPath);
            }
            return [];
        } catch (err) {
            console.warn(`Failed to read mock data for ${this.table}:`, err.message);
            return [];
        }
    }

    // Helper to write data to file
    async _writeData(data) {
        try {
            await fs.ensureDir(path.dirname(this.dataPath));
            await fs.writeJson(this.dataPath, data, { spaces: 2 });
        } catch (err) {
            console.error(`Failed to write mock data for ${this.table}:`, err);
        }
    }

    // Helper to construct WHERE clause (SQL) or Filter (JS)
    _buildWhere(query, paramsOffset = 1) {
        // SQL Logic
        const clauses = [];
        const values = [];
        let index = paramsOffset;

        for (const key in query) {
            if (Object.hasOwnProperty.call(query, key)) {
                clauses.push(`"${key}" = $${index}`);
                values.push(query[key]);
                index++;
            }
        }
        return {
            text: clauses.length > 0 ? 'WHERE ' + clauses.join(' AND ') : '',
            values
        };
    }

    _matchQuery(item, query) {
        for (const key in query) {
            if (item[key] != query[key]) return false; // Loose equality for ID strings vs numbers
        }
        return true;
    }

    async find(query = {}) {
        if (db.isMockMode) {
            const data = await this._readData();
            return data.filter(item => this._matchQuery(item, query));
        }

        const { text, values } = this._buildWhere(query);
        const sql = `SELECT * FROM "${this.table}" ${text}`;

        try {
            const res = await db.query(sql, values);
            return res.rows;
        } catch (err) {
            console.error(`Error finding in ${this.table}:`, err);
            throw new Error(err.message);
        }
    }

    async findOne(query) {
        if (db.isMockMode) {
            const data = await this._readData();
            return data.find(item => this._matchQuery(item, query)) || null;
        }

        const { text, values } = this._buildWhere(query);
        const sql = `SELECT * FROM "${this.table}" ${text} LIMIT 1`;

        try {
            const res = await db.query(sql, values);
            return res.rows[0] || null;
        } catch (err) {
            console.error(`Error findOne in ${this.table}:`, err);
            throw new Error(err.message);
        }
    }

    async create(doc) {
        const keys = Object.keys(doc);

        // Ensure _id and createdAt
        if (!doc._id) {
            doc._id = Date.now().toString(); // Fallback ID
            keys.push('_id');
        }
        if (!doc.createdAt) {
            doc.createdAt = new Date().toISOString();
            keys.push('createdAt');
        }

        if (db.isMockMode) {
            const data = await this._readData();
            data.push(doc);
            await this._writeData(data);
            return doc;
        }

        // JSON stringify objects/arrays
        const values = keys.map(key => {
            const val = doc[key];
            if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
                return JSON.stringify(val);
            }
            return val;
        });

        const columns = keys.map(k => `"${k}"`).join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const sql = `INSERT INTO "${this.table}" (${columns}) VALUES (${placeholders}) RETURNING *`;

        try {
            const res = await db.query(sql, values);
            return res.rows[0];
        } catch (err) {
            console.error(`Error creating in ${this.table}:`, err);
            throw new Error(err.message);
        }
    }

    async findByIdAndUpdate(id, update) {
        if (db.isMockMode) {
            const data = await this._readData();
            const index = data.findIndex(item => item._id == id);
            if (index !== -1) {
                // Merge update
                data[index] = { ...data[index], ...update };
                await this._writeData(data);
                return data[index];
            }
            return null;
        }

        const keys = Object.keys(update);
        if (keys.length === 0) return this.findOne({ _id: id });

        const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(', ');
        const values = [id, ...keys.map(key => {
            const val = update[key];
            if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
                return JSON.stringify(val);
            }
            return val;
        })];

        const sql = `UPDATE "${this.table}" SET ${setClause} WHERE "_id" = $1 RETURNING *`;

        try {
            const res = await db.query(sql, values);
            return res.rows[0];
        } catch (err) {
            console.error(`Error updating in ${this.table}:`, err);
            throw new Error(err.message);
        }
    }

    // Optional: Delete
    async deleteMany(query = {}) {
        if (db.isMockMode) {
            let data = await this._readData();
            const originalLength = data.length;
            data = data.filter(item => !this._matchQuery(item, query));
            if (data.length !== originalLength) {
                await this._writeData(data);
            }
            return;
        }

        const { text, values } = this._buildWhere(query);
        const sql = `DELETE FROM "${this.table}" ${text}`;
        try {
            await db.query(sql, values);
        } catch (err) {
            console.error(`Error deleting in ${this.table}:`, err);
            throw new Error(err.message);
        }
    }
}

module.exports = MockModel;
