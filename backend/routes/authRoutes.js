const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { verifyEmail, resendVerificationEmail } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/authController');

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Nama depan harus diisi')
    .isLength({ min: 2 })
    .withMessage('Nama depan minimal 2 karakter'),
  
  body('lastName')
    .optional()
    .trim(),
  
  body('faculty')
    .notEmpty()
    .withMessage('Fakultas harus diisi'),
    // .isLength({ min: 2, max: 2 })
    // .withMessage('Kode fakultas harus 2 digit'),
  
  body('major')
    .notEmpty()
    .withMessage('Program studi harus diisi'),
    // .isLength({ min: 2, max: 2 })
    // .withMessage('Kode program studi harus 2 digit'),

  body('majorCode')
    .notEmpty()
    .withMessage('Kode program studi harus diisi')      
    .isLength({ min: 3, max: 3 })
    .isNumeric()
    .withMessage('Kode program studi harus 3 digit angka'),  
  
  body('yearEntry')
    .notEmpty()
    .withMessage('Tahun masuk harus diisi')
    .isInt({ min: 2018, max: 2030 })
    .withMessage('Tahun masuk tidak valid'),
  
  body('npmLast3Digits')
    .notEmpty()
    .withMessage('Nomor identitas mahasiswa harus diisi')
    .isLength({ min: 3, max: 3 })
    .withMessage('Nomor identitas mahasiswa harus 3 digit')
    .isNumeric()
    .withMessage('Nomor identitas mahasiswa harus berupa angka'),
  
  body('password')
    .notEmpty()
    .withMessage('Password harus diisi')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter')
];

const loginValidation = [
  body('npm')
    .notEmpty()
    .withMessage('NPM harus diisi')
    .isLength({ min: 9, max: 9 })
    .withMessage('NPM harus 9 digit')
    .isNumeric()
    .withMessage('NPM harus berupa angka'),
  
  body('password')
    .notEmpty()
    .withMessage('Password harus diisi')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.get('/verify', verifyEmail);
router.post('/resend-email', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;