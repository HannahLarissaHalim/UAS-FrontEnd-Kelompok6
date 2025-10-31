const Vendor = require('../models/Vendor');

exports.getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().select('-__v');
        res.status(200).json({ success: true, data: vendors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getVendorWithMenus = async (req, res) => {
    try {
        const vendorId = req.params.id.toUpperCase();

        const vendor = await Vendor.findOne({ _id: vendorId })
            .populate('menus')
            .select('-__v'); 

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor tidak ditemukan.' });
        }

        res.status(200).json({ success: true, data: vendor });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data vendor' });
    }
};