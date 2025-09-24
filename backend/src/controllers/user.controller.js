import User from '../models/user.model.js';
import { StripeService } from '../services/stripeService.js';

// Helper function to generate tokens and set cookies
const generateTokensAndRespond = async (user, res, message) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save refresh token to user document
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Remove sensitive data from user object
        const safeUser = user.toSafeObject();

        // Set cookies and send response
        res.status(201)
            .cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 60 * 1000 // 30 minutes
            })
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            })
            .json({
                success: true,
                message,
                data: {
                    user: safeUser,
                    accessToken,
                    refreshToken
                }
            });
    } catch (error) {
        throw new Error(`Token generation failed: ${error.message}`);
    }
};

// Registration Controller
export const registerUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            userType,
            countryCode,
            countryName,
            phone = '',
            image = '',
            paymentMethodId // Only for bidders
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        let stripeCustomerId = null;
        let paymentMethodDetails = null;

        // Handle bidder-specific payment verification
        if (userType === 'bidder') {
            if (!paymentMethodId) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment method ID is required for bidders'
                });
            }

            try {
                // Create Stripe customer
                const customer = await StripeService.createCustomer(
                    email,
                    `${firstName} ${lastName}`
                );
                stripeCustomerId = customer.id;

                // VERIFY AND SAVE CARD FOR FUTURE USE
                const verificationResult = await StripeService.verifyAndSaveCard(
                    stripeCustomerId,
                    paymentMethodId
                );

                if (!verificationResult.success) {
                    throw new Error('Card verification failed');
                }

                paymentMethodDetails = verificationResult.paymentMethod;

            } catch (stripeError) {
                console.error('Stripe verification error:', stripeError);
                return res.status(400).json({
                    success: false,
                    message: `Card verification failed: ${stripeError.message}`
                });
            }
        }

        // Create user in database
        const userData = {
            firstName,
            lastName,
            username,
            email,
            password,
            userType,
            countryCode,
            countryName,
            phone,
            image,
            stripeCustomerId,
            isVerified: userType === 'seller' // Sellers are verified immediately
        };

        // Add payment details for bidders
        if (userType === 'bidder' && paymentMethodDetails) {
            userData.paymentMethodId = paymentMethodDetails.id;
            userData.cardLast4 = paymentMethodDetails.last4;
            userData.cardBrand = paymentMethodDetails.brand;
            userData.cardExpMonth = paymentMethodDetails.expMonth;
            userData.cardExpYear = paymentMethodDetails.expYear;
            userData.isVerified = true; // Bidders are verified after payment verification
            userData.isPaymentVerified = true;
        }

        const user = await User.create(userData);

        if (!user) {
            return res.status(500).json({
                success: false,
                message: 'User registration failed'
            });
        }

        await generateTokensAndRespond(user, res, 'Registration successful');

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

// Login Controller
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'No user found'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Wrong password'
            });
        }

        await generateTokensAndRespond(user, res, 'Login successful');

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

// Logout Controller
export const logoutUser = async (req, res) => {
    try {
        const user = req.user;

        // Clear refresh token from database
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });

        // Clear cookies
        res.clearCookie('accessToken')
            .clearCookie('refreshToken')
            .json({
                success: true,
                message: 'Logged out successfully'
            });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        });
    }
};

// Refresh Token Controller
export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        const newAccessToken = user.generateAccessToken();

        res.status(200)
            .cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000
            })
            .json({
                success: true,
                message: 'Access token refreshed',
                data: { accessToken: newAccessToken }
            });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token'
        });
    }
};