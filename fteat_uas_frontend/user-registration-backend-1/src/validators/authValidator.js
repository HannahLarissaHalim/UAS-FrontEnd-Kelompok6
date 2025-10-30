const { body, validationResult } = require('express-validator');

const validateRegistration = [
    body('firstName')
        .notEmpty().withMessage('First name is required')
        .isLength({ max: 50 }).withMessage('First name must be less than 50 characters'),
    
    body('lastName')
        .notEmpty().withMessage('Last name is required')
        .isLength({ max: 50 }).withMessage('Last name must be less than 50 characters'),
    
    body('faculty')
        .notEmpty().withMessage('Faculty is required')
        .isLength({ max: 100 }).withMessage('Faculty must be less than 100 characters'),
    
    body('major')
        .notEmpty().withMessage('Major is required')
        .isLength({ max: 100 }).withMessage('Major must be less than 100 characters'),
    
    body('yearOfEntry')
        .notEmpty().withMessage('Year of entry is required')
        .isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Year of entry must be a valid year'),
    
    body('email')
        .isEmail().withMessage('Email is not valid')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateRegistration,
    validate
};