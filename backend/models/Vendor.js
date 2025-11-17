const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
    },
    stallName: { 
        type: String,
        required: true,
    },
    bankName: { 
        type: String,
        required: true,
    },
    accountNumber: { 
        type: String,
        required: true,
    },
    accountHolder: { 
        type: String,
        required: true,
    },
    whatsapp: { 
        type: String,
        required: true,
    },

    status: { 
        type: String,
        enum: ['Available', 'Unavailable', 'Closed'],
        default: 'Unavailable'
    },
    VendorID: {
        type: String,
        required: true,
        unique: true,
    },
    email_address: { 
        type: String, 
        required: true
    }, 
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    id: true 
});

vendorSchema.virtual('menus', {
    ref: 'Menu',
    localField: 'VendorID', 
    foreignField: 'vendor', 
    justOne: false
});

const Vendor = mongoose.model('Vendor', vendorSchema, 'Vendors'); 
module.exports = Vendor;