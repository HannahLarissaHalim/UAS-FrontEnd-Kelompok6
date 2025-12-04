const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const vendorController = require('../controllers/vendorAuthController'); 
const { protect, authorize } = require('../middleware/auth'); 

router.post('/login', vendorController.vendorLogin); 
router.post('/register', vendorController.registerVendor); 
router.get('/admin/vendors', protect, authorize('admin'), vendorController.listVendorsForAdmin);
router.patch('/admin/vendors/:id/approve', protect, authorize('admin'), vendorController.setVendorApproval);
router.patch('/admin/vendors/:id', protect, authorize('admin'), vendorController.updateVendorByAdmin);
router.delete('/admin/vendors/:id', protect, authorize('admin'), vendorController.deleteVendor);
// Vendor updates own profile
router.put('/me', protect, authorize('vendor'), vendorController.updateVendorProfile);

module.exports = router;
