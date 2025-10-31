const KantinBursa = require('../models/KantinBursa');

exports.getKantinBursaMenus = async (req, res) => {
    try {
        const menus = await KantinBursa.find({ VendorID: 'VND002' })
            .sort({ Price: 1 }) 
            .select('-__v'); 

        res.status(200).json({
            success: true,
            count: menus.length,
            data: menus
        });
    } catch (error) {
        console.error('Error fetching Kantin Bursa menus:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal mengambil data menu Kantin Bursa.' 
        });
    }
};

exports.getKantinBursaMenuById = async (req, res) => {
    try {
        const menu = await KantinBursa.findById(req.params.id)
            .select('-__v');

        if (!menu) {
            return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });
        }

        res.status(200).json({ success: true, data: menu });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};