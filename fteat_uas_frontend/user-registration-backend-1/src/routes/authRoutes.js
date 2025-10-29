const express = require('express');
const { registerUser, verifyEmail } = require('../controllers/authController');
const { validateRegistration } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', validateRegistration, registerUser);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;