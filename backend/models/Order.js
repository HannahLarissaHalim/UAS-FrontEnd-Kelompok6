const mongoose = require('mongoose');

const orderedItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu', 
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  selectedAddOns: [{
    name: String,
    price: Number,
  }],
}, { _id: false }); 

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  vendor: {
    type: String, 
    ref: 'Vendor', 
    required: true,
  },
  items: [orderedItemSchema], 
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'paid'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'verified'],
    default: 'unpaid',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'transfer', 'ewallet'],
  },
  queueNumber: {
    type: String,
    default: null,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;