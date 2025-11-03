const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    menuId: {
        type: String, 
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    price: {
        type: Number, 
        required: true
    }
}, { _id: false }); 

const OrderSchema = new mongoose.Schema({
    _id: {
        type: String, 
        required: true
    },
    userId: {
        type: String, 
        required: true
    },
    vendorId: {
        type: String, 
        required: true
    },
    items: {
        type: [ItemSchema], 
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['processing', 'ready', 'pickedUp', 'cancelled'], 
        default: 'processing',
        required: true
    },
    pickupTime: {
        type: Date, 
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;