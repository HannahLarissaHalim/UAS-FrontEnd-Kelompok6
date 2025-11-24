const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak, token tidak ditemukan'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('[auth.protect] decoded token:', decoded);

    if (decoded && decoded.role) {
      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'vendor') {
        req.user = await Vendor.findById(decoded.id).select('-password');
      } else if (decoded.role === 'user' || decoded.role === 'customer') {
        // Support both 'user' and 'customer' roles in tokens
        req.user = await User.findById(decoded.id).select('-password');
      }
    } else {
      // Backwards-compatibility: tokens without a 'role' claim
      // Try to find the id in User -> Vendor -> Admin collections
      console.warn('[auth.protect] token missing role claim; attempting fallback lookups for id=', decoded && decoded.id);
      if (decoded && decoded.id) {
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          req.user = await Vendor.findById(decoded.id).select('-password');
        }
        if (!req.user) {
          req.user = await Admin.findById(decoded.id).select('-password');
        }
      }
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User/Vendor tidak ditemukan'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }
};

// Middleware to check user role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak, role tidak sesuai'
      });
    }
    next();
  };
};
