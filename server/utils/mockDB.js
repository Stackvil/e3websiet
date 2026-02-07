const fs = require('fs-extra');
const path = require('path');

const DB_DIR = path.join(__dirname, '../data');

class MockModel {
    constructor(name) {
        this.name = name;
        this.filePath = path.join(DB_DIR, `${name}.json`);
        fs.ensureDirSync(DB_DIR);
        if (!fs.existsSync(this.filePath)) {
            fs.writeJsonSync(this.filePath, []);
        }
    }

    async find(query = {}) {
        const data = await fs.readJson(this.filePath);
        return data.filter(item => {
            for (let key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });
    }

    async findOne(query) {
        const results = await this.find(query);
        return results[0] || null;
    }

    async create(doc) {
        const data = await fs.readJson(this.filePath);
        const newDoc = { ...doc, _id: Date.now().toString(), createdAt: new Date() };
        data.push(newDoc);
        await fs.writeJson(this.filePath, data);
        return newDoc;
    }

    async deleteMany(query = {}) {
        const data = await fs.readJson(this.filePath);
        const newData = data.filter(item => {
            for (let key in query) {
                if (item[key] === query[key]) return false;
            }
            return true;
        });
        await fs.writeJson(this.filePath, newData);
    }

    async insertMany(docs) {
        const data = await fs.readJson(this.filePath);
        const newDocs = docs.map(d => ({ ...d, _id: Math.random().toString(36).substr(2, 9), createdAt: new Date() }));
        data.push(...newDocs);
        await fs.writeJson(this.filePath, data);
        return newDocs;
    }

    async findByIdAndUpdate(id, update) {
        const data = await fs.readJson(this.filePath);
        const index = data.findIndex(item => item._id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...update };
            await fs.writeJson(this.filePath, data);
            return data[index];
        }
        return null;
    }
}

module.exports = MockModel;
