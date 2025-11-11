const mongoose = require('mongoose');

const addOnSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
}, { _id: false });

const menuSchema = new mongoose.Schema({
    category: { 
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0, 
    },
    vendor: {
        type: String,
        required: true,
        alias: 'VendorID', 
        ref: 'Vendor' 
    },
    variants: [String],
    addOns: [addOnSchema],
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    id: false 
});

menuSchema.pre('save', function(next) {
    if (this.isModified('VendorID') && this.get('VendorID')) {
        this.vendor = this.get('VendorID');
    }
    next();
});

const Menu = mongoose.model('Menu', menuSchema, 'Menus');
module.exports = Menu;