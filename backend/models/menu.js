const mongoose = require('mongoose');

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
    statusKetersediaan: {
        type: String,
        required: true,
        default: 'available',
    },
    vendor: { 
        type: String,
        required: true,
        ref: 'Vendor' 
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    id: false 
});

menuSchema.virtual('VendorID').get(function() {
    return this.vendor;
});

menuSchema.virtual('VendorID').set(function(value) {
    this.set('vendor', value);
});

const Menu = mongoose.model('Menu', menuSchema, 'Menus');
module.exports = Menu;