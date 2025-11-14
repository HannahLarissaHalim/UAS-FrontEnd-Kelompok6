const mongoose = require('mongoose');

const kantinBursaSchema = new mongoose.Schema({
    Kategori: { 
        type: String,
        required: true, 
    },
    NamaMenu: {
        type: String,
        required: true, 
    },
    VarianTopping: {
        type: String, 
    },
    Price: {
        type: Number,
        required: true,
    },
    statusKetersediaan: {
        type: String,
        required: true,
        default: 'available',
    },
    VendorID: {
        type: String,
        required: true,
        ref: 'Vendor'
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    id: false
});

kantinBursaSchema.virtual('vendorDetail', {
    ref: 'Vendor',
    localField: 'VendorID',
    foreignField: '_id',
    justOne: true 
});

const KantinBursa = mongoose.model('KantinBursa', kantinBursaSchema, 'Kantin Bursa');
module.exports = KantinBursa;