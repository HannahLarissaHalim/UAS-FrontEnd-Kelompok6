const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require("crypto");
const { sendVerificationEmail } = require("../services/emailService");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Helper function to format user response
const formatUserResponse = (user) => {
  const fullName = user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.firstName;
  
  return {
    userId: user._id,
    npm: user.npm,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    nickname: user.nickname, 
    displayName: user.nickname || fullName,
    role: user.role,
    faculty: user.faculty,
    major: user.major,
    majorCode: user.majorCode,
    yearEntry: user.yearEntry
  };
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

    // Generate verification token 
    const verificationToken = crypto.randomBytes(32).toString("hex");

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Send email verification
    await sendVerificationEmail(user.email, verificationToken);

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        ...formatUserResponse(user), // Use helper function
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

    // Ensure the user has verified their account (registered & confirmed email)
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Akun belum terverifikasi. Silakan verifikasi email terlebih dahulu.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        ...formatUserResponse(user), // Include nickname & displayName
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
      data: formatUserResponse(user) // Use helper function
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// @desc    Verify user email
// @route   GET /api/auth/verify?token=abc123
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // Check if token exists in query
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token tidak valid atau sudah digunakan'
      });
    }

    // Cek apakah token sudah kadaluwarsa
    if (!user.verificationTokenExpires || user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Link verifikasi sudah kedaluwarsa. Silakan kirim ulang email verifikasi.'
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Generate JWT token for auto-login after verification
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    // Send success response with user info
    res.json({
      success: true,
      message: 'Verifikasi berhasil',
      data: {
        ...formatUserResponse(user), // Use helper function
        token: jwtToken
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-email
// @access  Public
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Akun sudah diverifikasi.'
      });
    }

    // Always generate a new verification token
    // Every resend email has a fresh link
    const newToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = newToken;
    user.verificationTokenExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Send the new verification email with the updated token
    await sendVerificationEmail(user.email, newToken);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Email verifikasi telah dikirim ulang."
    });

  } catch (error) {
    // Log the error for debugging
    console.error("Resend verification error:", error);

    // Return a generic server error response
    res.status(500).json({
      success: false,
      message: "Failed to resend verification email."
    });
  }
};