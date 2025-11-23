const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    email: {                 // tambahkan field email
        type: String,
        required: true,
        unique: true
    },
    password: {               // hashed password
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    }
}, {
    timestamps: true
});

// Pre-save hook untuk hash password
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method untuk compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema, 'Admins'); // Collection "Admins"
module.exports = Admin;
