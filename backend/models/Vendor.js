const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    
    vendorFirstName: { 
        type: String,
        required: true
    },
    vendorLastName: { 
        type: String
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
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: { // hashed password
        type: String,
        required: true,
    },
    status: { 
        type: String,
        enum: ['Available', 'Unavailable', 'Closed'],
        default: 'Unavailable'
    },
     isApproved: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'vendor'
    },
    VendorId: {
        type: String,
        required: true,
        unique: true,
    },
    profileImage: {
        type: String,
        default: null,
    },
    pickupLocation: {
        type: String,
        default: 'FT Lt 7',
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    id: true 
});

vendorSchema.virtual('menus', {
    ref: 'Menu',
    localField: 'VendorId', 
    foreignField: 'vendor', 
    justOne: false
});

const Vendor = mongoose.model('Vendor', vendorSchema, 'Vendors'); 
module.exports = Vendor;