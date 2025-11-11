const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    _id: {
        type: String, 
        required: true,
        alias: 'vendorId',
        unique: true
    },
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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    id: false
});

vendorSchema.virtual('menus', {
    ref: 'Menu',
    localField: '_id',
    foreignField: 'VendorID', 
    justOne: false
});

const Vendor = mongoose.model('Vendor', vendorSchema, 'Vendors'); 
module.exports = Vendor;