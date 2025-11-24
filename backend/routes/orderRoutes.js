// Catatan: File ini berasumsi Express.js kembali digunakan.
const express = require('express');
const router = express.Router();
const {
    getOrders,
    getOrderById,
    getOrdersByUser,
    getOrdersByVendor,
    createOrder,
    updateOrderStatus,
    verifyPayment,
    cancelVerification
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth'); 

// Debug middleware for orders routes (development only)
router.use((req, res, next) => {
    try {
        console.log(`[orders] ${req.method} ${req.originalUrl} - Authorization: ${req.headers.authorization || 'none'}`);
    } catch (e) {
        console.error('Orders route logger error:', e);
    }
    next();
});

router.get('/', protect, getOrders); 

router.get('/:id', protect, getOrderById); 

router.get('/user/:userId', protect, getOrdersByUser); 

router.get('/vendor/:vendorId', protect, getOrdersByVendor); 

router.post('/create', protect, createOrder); 

router.put('/status/:id', protect, updateOrderStatus); 

// Payment verification routes
router.patch('/:id/verify', protect, verifyPayment);

router.patch('/:id/cancel-verification', protect, cancelVerification);

module.exports = router;