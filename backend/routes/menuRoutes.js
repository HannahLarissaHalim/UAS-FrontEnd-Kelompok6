const express = require('express');
const menuController = require('../controllers/menuController');

const router = express.Router();

router.post('/delete-multiple', menuController.deleteMultipleMenus);

router.get('/vendor/:vendorId', menuController.getMenusByVendor);

router.patch('/:id/stock', (req, res) => {
    menuController.updateStockStatus(req, res);
});

router.get('/', menuController.getMenus);

router.get('/:id', (req, res) => {
    const menuId = req.params.id;
    menuController.getMenuById(req, res, menuId);
});

router.post('/', menuController.createMenu);

router.put('/:id', menuController.updateMenu);

router.delete('/:id', (req, res) => {
    const menuId = req.params.id;
    menuController.deleteMenu(req, res, menuId);
});

module.exports = router;