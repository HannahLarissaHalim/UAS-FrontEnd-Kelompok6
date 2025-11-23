const bcrypt = require('bcrypt');
const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');

exports.vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(401).json({ success: false, message: 'Email atau password salah' });

    // cek apakah vendor sudah disetujui admin
    if (!vendor.isApproved) return res.status(403).json({ success: false, message: 'Akun vendor belum disetujui admin.' });

    const match = await bcrypt.compare(password, vendor.password);
    if (!match) return res.status(401).json({ success: false, message: 'Email atau password salah' });

    const token = jwt.sign({ id: vendor._id, role: 'vendor' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login vendor berhasil',
      data: {
        token,
        vendor
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.registerVendor = async (req, res) => {
  try {
    // Accept full vendor payload from frontend
    const {
      email,
      password,
      vendorFirstName,
      vendorLastName,
      stallName,
      bankName,
      accountNumber,
      accountHolder,
      whatsapp,
      VendorId
    } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password harus diisi' });
    }

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create vendor with all required fields
    const vendor = await Vendor.create({
      email,
      password: hashedPassword,
      vendorFirstName,
      vendorLastName,
      stallName,
      bankName,
      accountNumber,
      accountHolder,
      whatsapp,
      VendorId,
      isApproved: false
    });

    res.status(201).json({ success: true, message: 'Vendor berhasil terdaftar', data: vendor });
  } catch (error) {
    console.error('Vendor registration error:', error);

    // Send validation errors back as 400 when possible
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({ success: false, message: `${field || 'Field'} sudah terdaftar` });
    }

    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// List semua vendor untuk admin
exports.listVendorsForAdmin = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json({ success: true, data: vendors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// Set approval vendor
exports.setVendorApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(id, { isApproved }, { new: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor tidak ditemukan' });

    res.json({ success: true, message: 'Status vendor diperbarui', data: vendor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// Update vendor profile (self)
exports.updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user && req.user._id;
    if (!vendorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const update = req.body || {};

    // Prevent role or isApproved or password being changed by vendor directly
    delete update.role;
    delete update.isApproved;
    delete update.password;

    const vendor = await Vendor.findByIdAndUpdate(vendorId, update, { new: true, runValidators: true }).select('-password');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor tidak ditemukan' });

    res.json({ success: true, message: 'Profil vendor diperbarui', data: vendor });
  } catch (err) {
    console.error('Update vendor profile error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
