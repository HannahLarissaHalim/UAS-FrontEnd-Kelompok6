const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        alias: 'vendorId',
    },
    name: {
        type: String,
        required: true,
    },
    standName: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
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

const Vendor = mongoose.model('Vendor', vendorSchema, 'vendors'); 
module.exports = Vendor;