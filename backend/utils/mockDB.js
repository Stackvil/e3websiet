const db = require('./pgClient');

class MockModel {
    constructor(name) {
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
            'e4payment': 'e4payments'
        };

        const lowerName = name.toLowerCase();
        this.table = tableMappings[lowerName] || lowerName + 's';
    }

    // Helper to construct WHERE clause
    _buildWhere(query, paramsOffset = 1) {
        const clauses = [];
        const values = [];
        let index = paramsOffset;

        for (const key in query) {
            if (Object.hasOwnProperty.call(query, key)) {
                // Handle different query types if needed, currently assumes exact match
                // For 'user' field in orders, it might be a foreign key string
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

    async find(query = {}) {
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
