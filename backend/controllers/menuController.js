const Menu = require('../models/menu');

const sendJson = (res, statusCode, success, data, message) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' }); 
    
    res.end(JSON.stringify({ success, message, data }));
};
exports.getMenus = async (req, res) => {
    try {
        const menus = await Menu.find()
            .sort({ price: 1 })
            .select('-__v'); 

        sendJson(res, 200, true, menus, 'Daftar menu berhasil diambil.');
    } catch (error) {
        console.error('Error fetching menus:', error.message);
        sendJson(res, 500, false, null, 'Gagal mengambil data menu dari server.');
    }
};