const Indomie = require('../models/Indomie');

exports.getIndomieMenu = async (req, res) => {
    try {
        const menus = await Indomie.find()
            .select('-__v'); 

        res.status(200).json({
            success: true,
            count: menus.length,
            data: menus
        });
    } catch (error) {
        console.error('Error fetching Indomie menu:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal mengambil data menu Indomie.' 
        });
    }
};

exports.getIndomieMenuById = async (req, res) => {
    try {
        const menu = await Indomie.findById(req.params.id)
            .select('-__v');

        if (!menu) {
            return res.status(404).json({ success: false, message: 'Menu Indomie tidak ditemukan.' });
        }

        res.status(200).json({ success: true, data: menu });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};