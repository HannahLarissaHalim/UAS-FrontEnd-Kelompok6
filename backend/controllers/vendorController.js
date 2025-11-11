const Vendor = require('../models/Vendor');

const sendJson = (res, statusCode, success, data, message) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' }); 
    res.end(JSON.stringify({ success, message, data }));
};

exports.getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().select('-__v');

        sendJson(res, 200, true, vendors, 'Daftar semua vendor berhasil diambil.');
    } catch (error) {
        console.error('Error fetching vendors:', error.message);
        sendJson(res, 500, false, null, 'Gagal mengambil data vendor.');
    }
};

exports.getVendorWithMenus = async (req, res, id) => {
    try {
        const vendorId = id.toUpperCase();

        const vendor = await Vendor.findOne({ _id: vendorId })
            .populate('menus')
            .select('-__v'); 

        if (!vendor) {
            return sendJson(res, 404, false, null, 'Vendor tidak ditemukan.');
        }

        sendJson(res, 200, true, vendor, 'Detail vendor berhasil diambil.');
    } catch (error) {
        console.error('Error fetching vendor with menus:', error);
        sendJson(res, 500, false, null, 'Gagal mengambil data vendor.');
    }
};