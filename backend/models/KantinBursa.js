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
    Stock: {
        type: Number,
        required: true,
        default: 0,
    },
    VendorID: {
        type: String,
        required: true,
        ref: 'Vendor'
    },
}, { 
    timestamps: true 
});

const KantinBursa = mongoose.model('KantinBursa', kantinBursaSchema, 'Kantin Bursa');
module.exports = KantinBursa;