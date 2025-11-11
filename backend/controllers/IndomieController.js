const Indomie = require('../models/Indomie');

const sendJson = (res, statusCode, success, data, message) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success, message, data }));
};

exports.getIndomieMenu = async (req, res) => {
    try {
        const menus = await Indomie.find()
            .populate('vendorDetail', 'name stallName')
            .select('-__v'); 

        sendJson(res, 200, true, menus, 'Daftar menu Indomie berhasil diambil.');
    } catch (error) {
        console.error('Error fetching Indomie menu:', error.message);
        sendJson(res, 500, false, null, 'Gagal mengambil data menu Indomie.');
    }
};

exports.getIndomieMenuById = async (req, res, id) => {
    try {
        const menu = await Indomie.findById(id)
            .populate('vendorDetail', 'name stallName')
            .select('-__v');

        if (!menu) {
            return sendJson(res, 404, false, null, 'Menu Indomie tidak ditemukan.');
        }

        sendJson(res, 200, true, menu, 'Detail menu berhasil diambil.');
    } catch (error) {
        sendJson(res, 500, false, null, 'Gagal mengambil detail menu Indomie.');
    }
};