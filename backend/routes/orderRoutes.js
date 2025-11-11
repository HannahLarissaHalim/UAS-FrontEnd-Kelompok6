// Catatan: File ini berasumsi Express.js kembali digunakan.
const express = require('express');
const router = express.Router();
const {
    getOrders,
    getOrderById,
    getOrdersByUser,
    getOrdersByVendor,
    createOrder,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth'); 

router.get('/', protect, getOrders); 

router.get('/:id', protect, getOrderById); 

router.get('/user/:userId', protect, getOrdersByUser); 

router.get('/vendor/:vendorId', protect, getOrdersByVendor); 

router.post('/create', protect, createOrder); 

router.put('/status/:id', protect, updateOrderStatus); 

module.exports = router;