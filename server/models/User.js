const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: false }, // Made optional for mobile-first creation
    email: { type: String, required: false, unique: true, sparse: true }, // Sparse for unique but optional
    mobile: { type: String, required: false, unique: true, sparse: true }, // Added mobile
    password: { type: String, required: false }, // Made optional
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    rewardPoints: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
