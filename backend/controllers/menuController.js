const Menu = require('../models/menu');

exports.getMenus = async (req, res) => {
    try {
        const menus = await Menu.find()
            .sort({ price: 1 })
            .select('-__v'); 

        res.status(200).json({
            success: true,
            count: menus.length,
            data: menus
        });
    } catch (error) {
        console.error('Error fetching menus:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal mengambil data menu dari server.' 
        });
    }
};