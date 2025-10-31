const express = require('express');
const vendorController = require('../controllers/vendorController');
const router = express.Router();

router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorWithMenus);

module.exports = router;