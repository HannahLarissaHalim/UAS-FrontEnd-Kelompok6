const express = require('express');
const menuController = require('../controllers/menuController');

const router = express.Router();

// Delete multiple menus
router.post('/delete-multiple', menuController.deleteMultipleMenus);

// Get menus by vendor 
router.get('/vendor/:vendorId', (req, res) => {
    menuController.getMenusByVendor(req, res);
});

// Update stock status
router.patch('/:id/stock', (req, res) => {
    menuController.updateStockStatus(req, res);
});

// Get all menus
router.get('/', menuController.getMenus);

// Get menu by ID
router.get('/:id', (req, res) => {
    const menuId = req.params.id;
    menuController.getMenuById(req, res, menuId);
});

// Create new menu
router.post('/', menuController.createMenu);

// Update menu 
router.put('/:id', (req, res) => {
    menuController.updateMenu(req, res);
});

// Delete menu
router.delete('/:id', (req, res) => {
    const menuId = req.params.id;
    menuController.deleteMenu(req, res, menuId);
});

module.exports = router;