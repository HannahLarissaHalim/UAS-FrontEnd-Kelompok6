const KantinBursa = require('../models/KantinBursa');

const sendJson = (res, statusCode, success, data, message) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success, message, data }));
};

// 💡 MODIFIKASI FUNGSI INI
exports.getKantinBursaMenus = async (req, res) => {
    try {
        // MENGHAPUS FILTER { VendorID: 'VND002' } agar semua menu terambil
        const menus = await KantinBursa.find({}) 
            .populate('vendorDetail', 'name stallName') // Populate detail vendor
            .sort({ Price: 1 })
            .select('-__v'); 

        sendJson(res, 200, true, menus, 'Daftar semua menu Kantin Bursa berhasil diambil.');
    } catch (error) {
        console.error('Error fetching Kantin Bursa menus:', error.message);
        sendJson(res, 500, false, null, 'Gagal mengambil data menu Kantin Bursa.');
    }
};

exports.getKantinBursaMenuById = async (req, res, id) => {
    try {
        const menu = await KantinBursa.findById(id)
            .populate('vendorDetail', 'name stallName')
            .select('-__v');

        if (!menu) {
            return sendJson(res, 404, false, null, 'Menu Kantin Bursa tidak ditemukan.');
        }

        sendJson(res, 200, true, menu, 'Detail menu berhasil diambil.');
    } catch (error) {
        sendJson(res, 500, false, null, 'Gagal mengambil detail menu Kantin Bursa.');
    }
};