const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Route: GET /api/orders (Mendapatkan semua pesanan)
router.get('/', orderController.getAllOrders);

// Route: POST /api/orders (Membuat pesanan baru)
router.post('/', orderController.createOrder);

// Route: GET /api/orders/:orderId (Mendapatkan pesanan berdasarkan ID)
router.get('/:orderId', orderController.getOrderById);

// Route: PATCH /api/orders/:orderId/status (Memperbarui status pesanan)
router.patch('/:orderId/status', orderController.updateOrderStatus);

module.exports = router;