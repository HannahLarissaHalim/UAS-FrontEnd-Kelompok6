const Menu = require('../models/menu');

const sendJson = (res, statusCode, success, data, message) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success, message, data }));
};

// Debug mode - set to false in production
const DEBUG = process.env.NODE_ENV === 'development';

// Get all menus
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

// Get menu by ID
exports.getMenuById = async (req, res, menuId) => {
    try {
        const menu = await Menu.findById(menuId).select('-__v');

        if (!menu) {
            return sendJson(res, 404, false, null, 'Menu tidak ditemukan.');
        }

        sendJson(res, 200, true, menu, 'Menu berhasil diambil.');
    } catch (error) {
        console.error('Error fetching menu by ID:', error.message);
        sendJson(res, 500, false, null, 'Gagal mengambil data menu.');
    }
};

// Create new menu
exports.createMenu = async (req, res, body) => {
    try {
        let menuData;

        if (req.body) {
            menuData = req.body;
        } else if (body) {
            try {
                menuData = JSON.parse(body);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                return sendJson(res, 400, false, null, 'Format data tidak valid.');
            }
        } else {
            return sendJson(res, 400, false, null, 'Data menu tidak ditemukan.');
        }

        // Validasi data required
        if (!menuData.name) {
            return sendJson(res, 400, false, null, 'Nama menu wajib diisi.');
        }
        if (!menuData.category) {
            return sendJson(res, 400, false, null, 'Kategori menu wajib diisi.');
        }
        if (!menuData.price) {
            return sendJson(res, 400, false, null, 'Harga menu wajib diisi.');
        }

        //Identifier menggunakan nama vendor jika tidak ada id 
        const vendorIdentifier = menuData.vendor || menuData.vendorName || 'Kantin Teknik Bursa Lt.7';

        // buat menu object
        const newMenu = new Menu({
            name: menuData.name,
            category: menuData.category,
            brand: menuData.brand || '',
            price: parseInt(menuData.price),
            image: menuData.image || '/images/icon_small.png',
            statusKetersediaan: menuData.stock === 'habis' ? 'unavailable' : 'available',
            vendor: vendorIdentifier,
            time: menuData.time || '5~10 mins',
            hasTopping: menuData.hasTopping || false,
            additionals: menuData.additionals || []
        });

        const savedMenu = await newMenu.save();

        if (DEBUG) console.log('Menu saved:', savedMenu._id);

        sendJson(res, 201, true, savedMenu, 'Menu berhasil ditambahkan.');
    } catch (error) {
        console.error('Error creating menu:', error.message);
        sendJson(res, 500, false, null, 'Gagal menambahkan menu: ' + error.message);
    }
};

// Update menu 
exports.updateMenu = async (req, res, bodyOrMenuId, menuId) => {
    try {
        let updateData;
        let actualMenuId;

        if (req.body && req.params && req.params.id) {
            updateData = req.body;
            actualMenuId = req.params.id;

            if (DEBUG) {
                console.log('=== UPDATE MENU (Express) ===');
                console.log('Menu ID from params:', actualMenuId);
                console.log('Update data:', updateData);
            }
        } else if (menuId) {
            actualMenuId = menuId;
            try {
                updateData = JSON.parse(bodyOrMenuId);

                if (DEBUG) {
                    console.log('=== UPDATE MENU (HTTP Native - 4 params) ===');
                    console.log('Menu ID:', actualMenuId);
                    console.log('Update data:', updateData);
                }
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                return sendJson(res, 400, false, null, 'Format data tidak valid.');
            }
        } else if (bodyOrMenuId && typeof bodyOrMenuId === 'string') {
            if (bodyOrMenuId.length === 24 && /^[0-9a-fA-F]{24}$/.test(bodyOrMenuId)) {
                actualMenuId = bodyOrMenuId;
                let body = '';
                req.on('data', chunk => { body += chunk.toString(); });
                await new Promise((resolve, reject) => {
                    req.on('end', () => {
                        try {
                            updateData = JSON.parse(body);

                            if (DEBUG) {
                                console.log('=== UPDATE MENU (HTTP Native - streaming) ===');
                                console.log('Menu ID:', actualMenuId);
                                console.log('Update data:', updateData);
                            }

                            resolve();
                        } catch (parseError) {
                            console.error('JSON Parse Error:', parseError);
                            sendJson(res, 400, false, null, 'Format data tidak valid.');
                            reject(parseError);
                        }
                    });
                });
            } else {
                return sendJson(res, 400, false, null, 'Format request tidak valid.');
            }
        } else {
            return sendJson(res, 400, false, null, 'Data update tidak ditemukan.');
        }

        // Validate actualMenuId exists
        if (!actualMenuId) {
            return sendJson(res, 400, false, null, 'Menu ID tidak ditemukan.');
        }

        // Find existing menu
        const existingMenu = await Menu.findById(actualMenuId);
        if (!existingMenu) {
            return sendJson(res, 404, false, null, 'Menu tidak ditemukan.');
        }

        // Update fields, only update if value is provided
        if (updateData.name !== undefined) existingMenu.name = updateData.name;
        if (updateData.category !== undefined) existingMenu.category = updateData.category;
        if (updateData.brand !== undefined) existingMenu.brand = updateData.brand;
        if (updateData.price !== undefined) existingMenu.price = parseInt(updateData.price);
        if (updateData.image !== undefined) existingMenu.image = updateData.image;
        if (updateData.time !== undefined) existingMenu.time = updateData.time;
        if (updateData.hasTopping !== undefined) existingMenu.hasTopping = updateData.hasTopping;
        if (updateData.additionals !== undefined) existingMenu.additionals = updateData.additionals;

        // Update stock status
        if (updateData.stock !== undefined) {
            existingMenu.statusKetersediaan = updateData.stock === 'habis' ? 'unavailable' : 'available';
        }

        const updatedMenu = await existingMenu.save();

        if (DEBUG) console.log('Menu updated:', updatedMenu._id);

        sendJson(res, 200, true, updatedMenu, 'Menu berhasil diperbarui.');
    } catch (error) {
        console.error('Error updating menu:', error.message);
        console.error('Error stack:', error.stack);
        sendJson(res, 500, false, null, 'Gagal memperbarui menu.');
    }
};

// Delete menu
exports.deleteMenu = async (req, res, menuId) => {
    try {
        const deletedMenu = await Menu.findByIdAndDelete(menuId);

        if (!deletedMenu) {
            return sendJson(res, 404, false, null, 'Menu tidak ditemukan.');
        }

        if (DEBUG) console.log('Menu deleted:', menuId);

        sendJson(res, 200, true, { id: menuId }, 'Menu berhasil dihapus.');
    } catch (error) {
        console.error('Error deleting menu:', error.message);
        sendJson(res, 500, false, null, 'Gagal menghapus menu.');
    }
};

// Delete multiple menus
exports.deleteMultipleMenus = async (req, res, body) => {
    try {
        let data;
        if (req.body) {
            data = req.body;
        } else if (body) {
            try {
                data = JSON.parse(body);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                return sendJson(res, 400, false, null, 'Format data tidak valid.');
            }
        } else {
            return sendJson(res, 400, false, null, 'Data tidak ditemukan.');
        }

        const { menuIds } = data;

        if (!Array.isArray(menuIds) || menuIds.length === 0) {
            return sendJson(res, 400, false, null, 'Daftar ID menu tidak valid.');
        }

        const result = await Menu.deleteMany({ _id: { $in: menuIds } });

        if (DEBUG) console.log(`Deleted ${result.deletedCount} menus`);

        sendJson(res, 200, true, { deletedCount: result.deletedCount },
            `${result.deletedCount} menu berhasil dihapus.`);
    } catch (error) {
        console.error('Error deleting multiple menus:', error.message);
        sendJson(res, 500, false, null, 'Gagal menghapus menu.');
    }
};

// Get menus by vendor
exports.getMenusByVendor = async (req, res, vendorIdentifier) => {
    try {
        let actualVendorId;

        if (req.params && req.params.vendorId) {
            actualVendorId = req.params.vendorId;
        } else if (vendorIdentifier && typeof vendorIdentifier === 'string') {
            actualVendorId = vendorIdentifier;
        } else {
            return sendJson(res, 400, false, null, 'Vendor ID tidak ditemukan.');
        }

        // cari berdasarkan vendor ID atau vendor name
        const menus = await Menu.find({ vendor: actualVendorId })
            .sort({ createdAt: -1 })
            .select('-__v');

        if (DEBUG) console.log(`Loaded ${menus.length} menus for vendor: ${actualVendorId}`);

        sendJson(res, 200, true, menus, 'Daftar menu vendor berhasil diambil.');
    } catch (error) {
        console.error('Error fetching menus by vendor:', error.message);
        sendJson(res, 500, false, null, 'Gagal mengambil data menu vendor.');
    }
};

// Update stock status
exports.updateStockStatus = async (req, res, bodyOrMenuId, menuId) => {
    try {
        let data;
        let actualMenuId;

        if (req.body && req.params && req.params.id) {
            data = req.body;
            actualMenuId = req.params.id;
        } else if (menuId) {
            actualMenuId = menuId;
            try {
                data = JSON.parse(bodyOrMenuId);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                return sendJson(res, 400, false, null, 'Format data tidak valid.');
            }
        } else {
            return sendJson(res, 400, false, null, 'Data tidak ditemukan.');
        }

        const { stock } = data;

        const menu = await Menu.findById(actualMenuId);
        if (!menu) {
            return sendJson(res, 404, false, null, 'Menu tidak ditemukan.');
        }

        menu.statusKetersediaan = stock === 'habis' ? 'unavailable' : 'available';
        const updatedMenu = await menu.save();

        if (DEBUG) console.log('Stock updated:', actualMenuId, stock);

        sendJson(res, 200, true, updatedMenu, 'Status ketersediaan berhasil diperbarui.');
    } catch (error) {
        console.error('Error updating stock status:', error.message);
        sendJson(res, 500, false, null, 'Gagal memperbarui status ketersediaan.');
    }
};