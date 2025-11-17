const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

// daftar vendor dari .env
const allowedVendors = [
  {
    email: process.env.VENDOR1_EMAIL,
    password: process.env.VENDOR1_PASS,
  },
  {
    email: process.env.VENDOR2_EMAIL,
    password: process.env.VENDOR2_PASS,
  },
];

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // cek apakah email & password cocok dengan yang di .env
    const matchedVendor = allowedVendors.find(
      (v) => v.email === email && v.password === password
    );

    if (!matchedVendor) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    // cari info vendor dari database
    const vendorData = await Vendor.findOne({ contact: email });

    if (!vendorData) {
      return res.status(404).json({
        success: false,
        message: 'Data vendor tidak ditemukan di database',
      });
    }

    // generate token
    const token = jwt.sign(
      { id: vendorData._id, role: 'vendor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login vendor berhasil',
      data: {
        token,
        role: 'vendor',
        vendorId: vendorData._id,
        vendorName: vendorData.stallName,
        email: email,
      },
    });
  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
    });
  }
});

module.exports = router;
