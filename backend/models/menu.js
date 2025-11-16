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
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        default: ''
    },
    statusKetersediaan: {
        type: String,
        required: true,
        default: 'available',
        enum: ['available', 'unavailable']
    },
    vendor: { 
        type: String,
        required: true,
        ref: 'Vendor' 
    },
    time: {
        type: String,
        default: '5~10 mins'
    },
    hasTopping: {
        type: Boolean,
        default: false
    },
    additionals: [{
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }]
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

// Virtual field untuk stock compatibility dengan frontend
menuSchema.virtual('stock').get(function() {
    return this.statusKetersediaan === 'available' ? 'ada' : 'habis';
});

const Menu = mongoose.model('Menu', menuSchema, 'Menus');
module.exports = Menu;