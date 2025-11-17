const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

exports.vendorLogin = async (req, res, body) => {
  try {
    const { email, password } = JSON.parse(body);

    // daftar vendor dari .env (dibuat saat login untuk memastikan env sudah loaded)
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

    console.log('Login attempt for email:', email);
    console.log('Allowed vendors:', allowedVendors.map(v => ({ email: v.email, hasPassword: !!v.password })));

    // cek apakah email & password cocok dengan yang di .env
    const matchedVendor = allowedVendors.find(
      (v) => v.email === email && v.password === password
    );

    if (!matchedVendor) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        message: 'Email atau password salah',
      }));
    }

    // cari info vendor dari database
    const vendorData = await Vendor.findOne({ contact: email });

    if (!vendorData) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        message: 'Data vendor tidak ditemukan di database',
      }));
    }

    // generate token
    const token = jwt.sign(
      { id: vendorData._id, role: 'vendor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      message: 'Login vendor berhasil',
      data: {
        token,
        role: 'vendor',
        vendorId: vendorData._id,
        vendorName: vendorData.stallName,
        email: email,
      },
    }));
  } catch (error) {
    console.error('Vendor login error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Terjadi kesalahan server',
    }));
  }
};
