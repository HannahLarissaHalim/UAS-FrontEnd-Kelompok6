const Order = require('../models/Order');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Menu = require('../models/menu');

const sendJson = (res, statusCode, success, data, message) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success, message, data }));
};


exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name npm email')
            .sort({ createdAt: -1 });

        // Attach vendor documents by VendorId (order.vendor stores Vendor.VendorId string)
        const vendorIds = [...new Set(orders.map(o => o.vendor))].filter(Boolean);
        const vendors = await Vendor.find({ VendorId: { $in: vendorIds } });
        const vendorMap = {}; vendors.forEach(v => { vendorMap[v.VendorId] = v; });

        const ordersWithVendors = orders.map(o => {
            const obj = o.toObject ? o.toObject() : o;
            obj.vendorInfo = vendorMap[obj.vendor] || null;
            return obj;
        });

        sendJson(res, 200, true, ordersWithVendors, 'Daftar semua pesanan berhasil diambil.');
    } catch (error) {
        console.error('Error fetching orders:', error);
        sendJson(res, 500, false, null, 'Gagal mengambil data pesanan.');
    }
};

exports.createOrder = async (req, res) => {
    try {
        const orderData = req.body || {};

        console.log('[createOrder] incoming body:', JSON.stringify(orderData));
        try {
            console.log('[createOrder] Authorization header:', req.headers.authorization || 'none');
        } catch (e) {
            console.error('[createOrder] failed to read headers', e);
        }

        const { user: userId, vendor: vendorId, totalPrice, items } = orderData;

        if (!userId || !vendorId || !totalPrice || !Array.isArray(items) || items.length === 0) {
            return sendJson(res, 400, false, null, 'Data pesanan tidak lengkap. Pastikan user, vendor, items, totalPrice terisi.');
        }

        // Validate user exists
        const user = await User.findById(userId);
        console.log(`[createOrder] lookup userId=${userId} ->`, user ? 'FOUND' : 'NOT FOUND');
        if (!user) {
            return sendJson(res, 404, false, null, 'User tidak ditemukan. Pastikan userId valid dan sudah login.');
        }

        // Validate vendor exists by VendorId (vendor field is a string VendorId)
        const vendor = await Vendor.findOne({ VendorId: vendorId });
        console.log(`[createOrder] lookup vendorId=${vendorId} ->`, vendor ? `FOUND (Vendor._id=${vendor._id})` : 'NOT FOUND');
        if (!vendor) {
            return sendJson(res, 404, false, null, 'Vendor tidak ditemukan. Pastikan VendorId benar.');
        }

        // Validate each menu item exists and (optionally) belongs to this vendor
        console.log(`[createOrder] items count=${items.length}`);
        for (let idx = 0; idx < items.length; idx++) {
            const it = items[idx];
            console.log(`[createOrder] item[${idx}] menuItem=${it.menuItem} quantity=${it.quantity}`);

            if (!it.menuItem) {
                return sendJson(res, 400, false, null, 'Salah satu item tidak memiliki menuItem id.');
            }

            const menu = await Menu.findById(it.menuItem);
            if (!menu) {
                console.log(`[createOrder] menu not found for id=${it.menuItem}`);
                return sendJson(res, 404, false, null, `Menu dengan id ${it.menuItem} tidak ditemukan.`);
            }

            if (String(menu.vendor) !== String(vendor.VendorId)) {
                console.log(`[createOrder] menu.vendor=${menu.vendor} does not match vendor.VendorId=${vendor.VendorId}`);
                return sendJson(res, 400, false, null, `Menu ${menu._id} tidak dimiliki oleh vendor ${vendorId}.`);
            }
        }

        const order = await Order.create(orderData);

        sendJson(res, 201, true, order, 'Pesanan berhasil dibuat.');
    } catch (error) {
        console.error('Error creating order:', error);
        sendJson(res, 500, false, null, 'Gagal membuat pesanan.');
    }
};


exports.getOrderById = async (req, res) => {
    try {
        const id = req.params.id;
        const order = await Order.findById(id).populate('user', 'name npm email');

        // Attach vendor info if available (vendor stored as VendorId string)
        if (order) {
            const vendorDoc = await Vendor.findOne({ VendorId: order.vendor }).catch(() => null);
            const orderObj = order.toObject ? order.toObject() : order;
            orderObj.vendorInfo = vendorDoc || null;
            sendJson(res, 200, true, orderObj, 'Detail pesanan berhasil diambil.');
            return;
        }
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        sendJson(res, 500, false, null, 'Gagal mengambil detail pesanan.');
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body || {};

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
exports.verifyPayment = async (req, res) => {
    try {
        const id = req.params.id;
        const { vendorId: vendorIdFromBody } = req.body || {};

        console.log(`[verifyPayment] orderId=${id} vendorIdFromBody=${vendorIdFromBody}`);

        const order = await Order.findById(id).populate('user', 'name email');

        if (!order) {
            console.log(`[verifyPayment] order not found id=${id}`);
            return sendJson(res, 404, false, null, `Pesanan dengan ID ${id} tidak ditemukan.`);
        }

        if (order.paymentStatus === 'verified') {
            console.log(`[verifyPayment] order already verified id=${id}`);
            return sendJson(res, 400, false, null, 'Pembayaran sudah diverifikasi sebelumnya.');
        }

        // Determine acting vendor: prefer authenticated user (req.user) if present
        let actingVendor = null;
        try {
            if (req.user && req.user._id) {
                actingVendor = await Vendor.findById(req.user._id);
            }
        } catch (e) {
            console.warn('[verifyPayment] failed to resolve req.user as vendor:', e.message);
        }

        // If no vendor from token, try resolving from body (VendorId or ObjectId)
        if (!actingVendor && vendorIdFromBody) {
            actingVendor = await Vendor.findOne({ VendorId: vendorIdFromBody }) || await Vendor.findById(vendorIdFromBody).catch(() => null);
        }

        console.log('[verifyPayment] actingVendor resolved ->', actingVendor ? `Vendor._id=${actingVendor._id} VendorId=${actingVendor.VendorId}` : 'NOT FOUND');

        if (!actingVendor) {
            return sendJson(res, 401, false, null, 'Vendor tidak dikenali atau tidak terautentikasi.');
        }

        // Ensure the order belongs to this vendor. Order.vendor stores VendorId string.
        const orderVendorIdentifier = order.vendor;
        const vendorMatches = (String(actingVendor.VendorId) === String(orderVendorIdentifier)) || (String(actingVendor._id) === String(orderVendorIdentifier));

        console.log(`[verifyPayment] order.vendor=${orderVendorIdentifier} vendorMatches=${vendorMatches}`);

        if (!vendorMatches) {
            return sendJson(res, 403, false, null, 'Vendor tidak berwenang memverifikasi pesanan ini.');
        }

        // Generate queue number
        const queueNumber = await generateQueueNumber(new Date());

        // Update order: set verifiedBy to vendor ObjectId
        order.paymentStatus = 'verified';
        order.status = 'paid';
        order.queueNumber = queueNumber;
        order.verifiedAt = new Date();
        order.verifiedBy = actingVendor._id;

        await order.save();

        // TODO: Send email notification to customer
        // sendEmailNotification(order.user.email, order.queueNumber);

        sendJson(res, 200, true, order, `Pembayaran berhasil diverifikasi. Nomor antrian: ${queueNumber}`);
    } catch (error) {
        console.error('Error verifying payment:', error, error.stack);
        sendJson(res, 500, false, null, 'Gagal memverifikasi pembayaran.');
    }
};

// Cancel verification endpoint
exports.cancelVerification = async (req, res) => {
    try {
        const id = req.params.id;
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

// Get orders by user
exports.getOrdersByUser = async (req, res) => {
    try {
        const userId = req.params.userId || req.query.userId;
        console.log(`[getOrdersByUser] incoming userId param=${userId} Authorization=${req.headers.authorization || 'none'}`);

        const orders = await Order.find({ user: userId })
            .populate('items.menuItem', 'name price image') // Populate menu details with image
            .sort({ createdAt: -1 });

        // Attach vendor info for each order (vendor stored as VendorId string)
        const vendorIds = [...new Set(orders.map(o => o.vendor))].filter(Boolean);
        let vendors = [];
        if (vendorIds.length > 0) {
            vendors = await Vendor.find({ VendorId: { $in: vendorIds } });
        }
        const vendorMap = {}; vendors.forEach(v => { vendorMap[v.VendorId] = v; });

        const ordersWithVendorInfo = orders.map(o => {
            const obj = o.toObject ? o.toObject() : o;
            obj.vendorInfo = vendorMap[obj.vendor] || null;
            // Also add pickupLocation from vendor if order doesn't have it
            if (!obj.pickupLocation && obj.vendorInfo) {
                obj.pickupLocation = obj.vendorInfo.pickupLocation || 'FT Lt 7';
            }
            // Flatten menu item data into items for easier frontend consumption
            if (obj.items && Array.isArray(obj.items)) {
                obj.items = obj.items.map(item => {
                    const menuData = item.menuItem || {};
                    return {
                        ...item,
                        name: menuData.name || item.name || 'Menu',
                        price: menuData.price || item.price || 0,
                        image: menuData.image || item.image || '/images/ikon_indomie.png',
                        menuItem: menuData._id || item.menuItem
                    };
                });
            }
            return obj;
        });

        console.log(`[getOrdersByUser] found orders count=${orders.length} for userId=${userId}`);

        sendJson(res, 200, true, ordersWithVendorInfo, 'Daftar pesanan pengguna berhasil diambil.');
    } catch (error) {
        console.error('Error fetching user orders:', error);
        sendJson(res, 500, false, null, 'Gagal mengambil data pesanan pengguna.');
    }
};

// Get orders by vendor
exports.getOrdersByVendor = async (req, res) => {
    try {
        const vendorId = req.params.vendorId || req.query.vendorId;
        const orders = await Order.find({ vendor: vendorId })
            .populate('user', 'name npm email')
            .populate('items.menuItem', 'name price image') // Populate menu details
            .sort({ createdAt: -1 });

        // Attach vendor info (single vendorId)
        const vendorDoc = await Vendor.findOne({ VendorId: vendorId }).catch(() => null);
        const ordersWithVendor = orders.map(o => {
            const obj = o.toObject ? o.toObject() : o;
            obj.vendorInfo = vendorDoc || null;
            // Add pickupLocation from vendor if order doesn't have it
            if (!obj.pickupLocation && vendorDoc) {
                obj.pickupLocation = vendorDoc.pickupLocation || 'FT Lt 7';
            }
            // Flatten menu item data into items for easier frontend consumption
            if (obj.items && Array.isArray(obj.items)) {
                obj.items = obj.items.map(item => {
                    const menuData = item.menuItem || {};
                    return {
                        ...item,
                        name: menuData.name || 'Menu tidak ditemukan',
                        price: menuData.price || 0,
                        image: menuData.image || '/images/ikon_indomie.png',
                        menuItem: menuData._id || item.menuItem // Keep reference
                    };
                });
            }
            return obj;
        });

        sendJson(res, 200, true, ordersWithVendor, 'Daftar pesanan vendor berhasil diambil.');
    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        sendJson(res, 500, false, null, 'Gagal mengambil data pesanan vendor.');
    }
};