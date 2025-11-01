const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { 
      firstName, 
      lastName, 
      faculty, 
      major, 
      majorCode,  
      yearEntry, 
      npmLast3Digits,
      password 
    } = req.body;

    // NPM Format: majorCode(3) + year(2) + 0 + customDigits(3) = 9 digits
    // Example: Major SI (535) + Year 2024 (24) + 0 + 023 = 535240023
    
    const yearShort = yearEntry.toString().slice(-2); // Last 2 digits of year (e.g., '24')
    
    // Generate NPM: MajorCode(3) + Year(2) + 0 + Last3Digits(3)
    const npmPrefix = `${majorCode}${yearShort}0`; // e.g., '53524'
    const fullNPM = npmPrefix + npmLast3Digits; // e.g., '535240023'

    // Validate NPM length
    if (fullNPM.length !== 9) {
      return res.status(400).json({
        success: false,
        message: 'Format NPM tidak valid'
      });
    }

    // Generate email: firstname.NPM@stu.untar.ac.id
    const email = `${firstName.toLowerCase()}.${fullNPM}@stu.untar.ac.id`;

    // Check if user already exists
    const existingUserByNPM = await User.findOne({ npm: fullNPM });
    if (existingUserByNPM) {
      return res.status(400).json({
        success: false,
        message: 'NPM sudah terdaftar'
      });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName: lastName || '',
      faculty,
      major,
      majorCode,
      yearEntry: parseInt(yearEntry),
      npm: fullNPM,
      email,
      password,
      role: 'customer'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        userId: user._id,
        npm: user.npm,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field === 'npm' ? 'NPM' : 'Email'} sudah terdaftar`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { npm, password } = req.body;

    // Validate input
    if (!npm || !password) {
      return res.status(400).json({
        success: false,
        message: 'NPM dan password harus diisi'
      });
    }

    // Find user by NPM
    const user = await User.findOne({ npm });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'NPM atau password salah'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'NPM atau password salah'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        userId: user._id,
        npm: user.npm,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};
