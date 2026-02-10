const supabase = require('./supabaseClient');

class MockModel {
    constructor(name) {
        // Map model names to table names with special handling
        const tableMappings = {
            'user': 'users',
            'order': 'orders',
            'e3ride': 'e3rides',
            'e3dine': 'e3dines',
            'e4ride': 'e4rides',
            'e4dine': 'e4dines',
            'event': 'events',
            'sponsor': 'sponsors',
            'analytics': 'analytics', // Already plural, don't add 's'
            'booking': 'bookings'
        };

        const lowerName = name.toLowerCase();
        this.table = tableMappings[lowerName] || lowerName + 's';
    }

    async find(query = {}) {
        let queryBuilder = supabase.from(this.table).select('*');

        // Handle query object
        for (const key in query) {
            queryBuilder = queryBuilder.eq(key, query[key]);
        }

        const { data, error } = await queryBuilder;
        if (error) {
            console.error(`Error finding in ${this.table}:`, error);
            throw new Error(error.message);
        }
        return data || [];
    }

    async findOne(query) {
        let queryBuilder = supabase.from(this.table).select('*');
        for (const key in query) {
            queryBuilder = queryBuilder.eq(key, query[key]);
        }

        const { data, error } = await queryBuilder.single();

        // Supabase returns error PGRST116 for no rows, which implies null
        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error(`Error findOne in ${this.table}:`, error);
            throw new Error(error.message);
        }
        return data;
    }

    async create(doc) {
        // Supabase expects specific fields. Ensure _id is handled or generate it if relying on it.
        // Our setup script created tables with _id as text primary key.
        // If doc doesn't have _id, generate one? Backend logic usually relies on DB generating ID
        // but current MockDB generated it if missing.

        const docToInsert = { ...doc };
        if (!docToInsert._id) {
            docToInsert._id = Date.now().toString(); // Fallback ID generation same as MockDB
        }
        if (!docToInsert.createdAt) {
            docToInsert.createdAt = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from(this.table)
            .insert(docToInsert)
            .select()
            .single();

        if (error) {
            console.error(`Error creating in ${this.table}:`, error);
            throw new Error(error.message);
        }
        return data;
    }

    async deleteMany(query = {}) {
        let queryBuilder = supabase.from(this.table).delete();
        for (const key in query) {
            queryBuilder = queryBuilder.eq(key, query[key]);
        }
        const { error } = await queryBuilder;
        if (error) {
            console.error(`Error deleting in ${this.table}:`, error);
            throw new Error(error.message);
        }
    }

    async insertMany(docs) {
        const docsToInsert = docs.map(d => ({
            ...d,
            _id: d._id || Math.random().toString(36).substr(2, 9),
            createdAt: d.createdAt || new Date().toISOString()
        }));

        const { data, error } = await supabase
            .from(this.table)
            .insert(docsToInsert)
            .select();

        if (error) {
            console.error(`Error insertMany in ${this.table}:`, error);
            throw new Error(error.message);
        }
        return data;
    }

    async findByIdAndUpdate(id, update) {
        const { data, error } = await supabase
            .from(this.table)
            .update(update)
            .eq('_id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating in ${this.table}:`, error);
            throw new Error(error.message);
        }
        return data;
    }
}

module.exports = MockModel;
