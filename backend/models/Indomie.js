const mongoose = require('mongoose');

const addOnSchema = new mongoose.Schema({
    ToppingName: { type: String, required: true },
    AdditionalPrice: { type: Number, required: true },
    isLimited: { type: Boolean, default: false },
}, { _id: false });

const indomieSchema = new mongoose.Schema({
    NamaMenu: { 
        type: String,
        required: true, 
    },
    BasePrice: {
        type: Number,
        required: true,
    },
    VendorID: {
        type: String,
        required: true,
        ref: 'Vendor',
        default: 'VND002' 
    },
    Varian: {
        type: [String], 
        required: true,
    },
    AddOns: {
        type: [addOnSchema], 
        required: true,
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    id: false
});

indomieSchema.virtual('vendorDetail', {
    ref: 'Vendor',
    localField: 'VendorID',
    foreignField: '_id',
    justOne: true 
});

const Indomie = mongoose.model('Indomie', indomieSchema, 'Indomie'); 
module.exports = Indomie;