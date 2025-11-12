const Order = require('../models/Order');

const sendJson = (res, statusCode, success, data, message) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success, message, data }));
};


exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name npm email') 
            .populate('vendor', 'name stallName') 
            .sort({ createdAt: -1 }); 

        sendJson(res, 200, true, orders, 'Daftar semua pesanan berhasil diambil.');
    } catch (error) {
        console.error('Error fetching orders:', error);
        sendJson(res, 500, false, null, 'Gagal mengambil data pesanan.');
    }
};

exports.createOrder = async (req, res, body) => {
    try {
        const orderData = JSON.parse(body);

        if (!orderData.user || !orderData.vendor || !orderData.totalPrice || orderData.items.length === 0) {
            return sendJson(res, 400, false, null, 'Data pesanan tidak lengkap.');
        }

        const order = await Order.create(orderData);

        sendJson(res, 201, true, order, 'Pesanan berhasil dibuat.');
    } catch (error) {
        console.error('Error creating order:', error);
        sendJson(res, 500, false, null, 'Gagal membuat pesanan.');
    }
};


exports.getOrderById = async (req, res, id) => {
    try {
        const order = await Order.findById(id)
            .populate('user', 'name npm email')
            .populate('vendor', 'name stallName');

        if (!order) {
            return sendJson(res, 404, false, null, `Pesanan dengan ID ${id} tidak ditemukan.`);
        }

        sendJson(res, 200, true, order, 'Detail pesanan berhasil diambil.');
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        sendJson(res, 500, false, null, 'Gagal mengambil detail pesanan.');
    }
};

exports.updateOrderStatus = async (req, res, id, body) => {
    try {
        const { status } = JSON.parse(body);

        if (!status || !['processing', 'completed', 'cancelled'].includes(status)) {
            return sendJson(res, 400, false, null, 'Status pesanan tidak valid.');
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return sendJson(res, 404, false, null, `Pesanan dengan ID ${id} tidak ditemukan.`);
        }

        sendJson(res, 200, true, order, `Status pesanan berhasil diubah menjadi ${status}.`);
    } catch (error) {
        console.error('Error updating order status:', error);
        sendJson(res, 500, false, null, 'Gagal memperbarui status pesanan.');
    }
};

// Generate queue number based on date
const generateQueueNumber = async (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Count orders verified today
    const count = await Order.countDocuments({
        verifiedAt: {
            $gte: startOfDay,
            $lte: endOfDay
        },
        queueNumber: { $ne: null }
    });

    // Format: 001, 002, 003, etc.
    return String(count + 1).padStart(3, '0');
};

// Verify payment endpoint
exports.verifyPayment = async (req, res, id, body) => {
    try {
        const { vendorId } = JSON.parse(body);

        const order = await Order.findById(id).populate('user', 'name email');

        if (!order) {
            return sendJson(res, 404, false, null, `Pesanan dengan ID ${id} tidak ditemukan.`);
        }

        if (order.paymentStatus === 'verified') {
            return sendJson(res, 400, false, null, 'Pembayaran sudah diverifikasi sebelumnya.');
        }

        // Generate queue number
        const queueNumber = await generateQueueNumber(new Date());

        // Update order
        order.paymentStatus = 'verified';
        order.status = 'paid';
        order.queueNumber = queueNumber;
        order.verifiedAt = new Date();
        order.verifiedBy = vendorId;

        await order.save();

        // TODO: Send email notification to customer
        // sendEmailNotification(order.user.email, order.queueNumber);

        sendJson(res, 200, true, order, `Pembayaran berhasil diverifikasi. Nomor antrian: ${queueNumber}`);
    } catch (error) {
        console.error('Error verifying payment:', error);
        sendJson(res, 500, false, null, 'Gagal memverifikasi pembayaran.');
    }
};

// Cancel verification endpoint
exports.cancelVerification = async (req, res, id) => {
    try {
        const order = await Order.findById(id);

        if (!order) {
            return sendJson(res, 404, false, null, `Pesanan dengan ID ${id} tidak ditemukan.`);
        }

        if (order.paymentStatus !== 'verified') {
            return sendJson(res, 400, false, null, 'Pembayaran belum diverifikasi.');
        }

        // Reset verification
        order.paymentStatus = 'unpaid';
        order.status = 'pending';
        order.queueNumber = null;
        order.verifiedAt = null;
        order.verifiedBy = null;

        await order.save();

        sendJson(res, 200, true, order, 'Verifikasi pembayaran berhasil dibatalkan.');
    } catch (error) {
        console.error('Error canceling verification:', error);
        sendJson(res, 500, false, null, 'Gagal membatalkan verifikasi.');
    }
};

// Get orders by vendor
exports.getOrdersByVendor = async (req, res, vendorId) => {
    try {
        const orders = await Order.find({ vendor: vendorId })
            .populate('user', 'name npm email')
            .sort({ createdAt: -1 });

        sendJson(res, 200, true, orders, 'Daftar pesanan vendor berhasil diambil.');
    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        sendJson(res, 500, false, null, 'Gagal mengambil data pesanan vendor.');
    }
};