import { body, validationResult } from 'express-validator';

// Common validation rules
export const validateRegistration = [
    body('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters')
        .escape(),
    
    body('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters')
        .escape(),
    
    body('username')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Username must be between 3 and 30 characters')
        .isAlphanumeric()
        .withMessage('Username can only contain letters and numbers'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    
    body('userType')
        .isIn(['bidder', 'seller'])
        .withMessage('User type must be either bidder or seller'),
    
    body('country')
        .trim()
        .isLength({ min: 2, max: 56 })
        .withMessage('Please provide a valid country name')
];

// Bidder-specific validation
export const validateBidderRegistration = [
    ...validateRegistration,
    body('paymentMethodId')
        .if(body('userType').equals('bidder'))
        .notEmpty()
        .withMessage('Payment method ID is required for bidders')
];

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};