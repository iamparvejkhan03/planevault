import User from '../models/user.model.js';
import { StripeService } from '../services/stripeService.js';
import jwt from "jsonwebtoken";
import { newUserRegistrationEmail, resetPasswordEmail, welcomeEmail } from '../utils/nodemailer.js';
import crypto from "crypto";
import BidPayment from '../models/bidPayment.model.js';

// Helper function to generate tokens and set cookies
const generateTokensAndRespond = async (user, req, res, message) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        const resetToken = user.generateResetPasswordToken();

        // Save refresh token to user document
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Remove sensitive data from user object
        const safeUser = user.toSafeObject();

        // await loginUser(req, res);

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

        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.toLowerCase().trim();

        // Check if user already exists with normalized email
        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { username: normalizedUsername }
            ]
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
        // if (userType === 'bidder') {
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
        // }

        // Create user in database
        const userData = {
            firstName,
            lastName,
            username: normalizedUsername,
            email: normalizedEmail,
            password,
            userType,
            countryCode,
            countryName,
            phone,
            image,
            stripeCustomerId,
            isVerified: false
        };

        // Add payment details for bidders
        // if (userType === 'bidder' && paymentMethodDetails) {
        if (paymentMethodDetails) {
            userData.paymentMethodId = paymentMethodDetails.id;
            userData.cardLast4 = paymentMethodDetails.last4;
            userData.cardBrand = paymentMethodDetails.brand;
            userData.cardExpMonth = paymentMethodDetails.expMonth;
            userData.cardExpYear = paymentMethodDetails.expYear;
            userData.isVerified = true; // Users are verified after payment verification
            userData.isPaymentVerified = true;
        }

        const user = await User.create(userData);

        if (!user) {
            return res.status(500).json({
                success: false,
                message: 'User registration failed'
            });
        }

        // await generateTokensAndRespond(user, res, 'Registration successful');
        await generateTokensAndRespond(user, req, res, 'Registration successful');

        //send registration email
        await welcomeEmail(user);

        const adminUsers = await User.find({ userType: 'admin' });
        for (const admin of adminUsers) {
            await newUserRegistrationEmail(admin.email, user);
        }

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

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });

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

        // await generateTokensAndRespond(user, res, 'Login successful');
        await generateTokensAndRespond(user, req, res, 'Login successful');

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

// Refresh Access Token
export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        // Update refresh token in database
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Access token refreshed',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });

    } catch (error) {
        console.error('Token refresh error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expired'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error during token refresh'
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
        }

        const resetToken = await user.generateResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const url = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const emailSent = await resetPasswordEmail(user.email, url);

        if (!emailSent) {
            user.resetPasswordToken = null;
            user.resetPasswordTokenExpiry = null;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Could not send email' });
        }

        return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;

        const { newPassword } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordTokenExpiry: { $gt: Date.now() } })

        if (!user) {
            return res.status(200).json({ success: true, message: 'Token is invalid or has expired' });
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({ success: true, message: 'Password updated' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to get user' });
    }
}

// Add these to your user controller

export const getBillingInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            'stripeCustomerId paymentMethodId cardLast4 cardBrand cardExpMonth cardExpYear isPaymentVerified userType'
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const billingInfo = {
            stripeCustomerId: user.stripeCustomerId,
            isPaymentVerified: user.isPaymentVerified,
            userType: user.userType
        };

        // Add card details if available
        if (user.cardLast4) {
            billingInfo.card = {
                last4: user.cardLast4,
                brand: user.cardBrand,
                expMonth: user.cardExpMonth,
                expYear: user.cardExpYear
            };
        }

        res.status(200).json({
            success: true,
            data: billingInfo
        });

    } catch (error) {
        console.error('Get billing info error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching billing information'
        });
    }
};

// export const updatePaymentMethod = async (req, res) => {
//     try {
//         const { paymentMethodId } = req.body;
//         const userId = req.user._id;

//         if (!paymentMethodId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Payment method ID is required'
//             });
//         }

//         const user = await User.findById(userId);
        
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         if (!user.stripeCustomerId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'No Stripe customer found'
//             });
//         }

//         // Verify and update card with Stripe (using the same function from registration)
//         const verificationResult = await StripeService.verifyAndSaveCard(
//             user.stripeCustomerId,
//             paymentMethodId
//         );

//         if (!verificationResult.success) {
//             throw new Error('Card verification failed');
//         }

//         const paymentMethodDetails = verificationResult.paymentMethod;

//         // Update user in database
//         user.paymentMethodId = paymentMethodDetails.id;
//         user.cardLast4 = paymentMethodDetails.last4;
//         user.cardBrand = paymentMethodDetails.brand;
//         user.cardExpMonth = paymentMethodDetails.expMonth;
//         user.cardExpYear = paymentMethodDetails.expYear;
//         user.isPaymentVerified = true;

//         await user.save();

//         const updatedCardInfo = {
//             last4: user.cardLast4,
//             brand: user.cardBrand,
//             expMonth: user.cardExpMonth,
//             expYear: user.cardExpYear
//         };

//         res.status(200).json({
//             success: true,
//             message: 'Payment method updated successfully',
//             data: {
//                 card: updatedCardInfo,
//                 isPaymentVerified: true,
//                 userType: user.userType,
//                 stripeCustomerId: user.stripeCustomerId
//             }
//         });

//     } catch (error) {
//         console.error('Update payment method error:', error);
//         res.status(400).json({
//             success: false,
//             message: error.message || 'Failed to update payment method'
//         });
//     }
// };

export const updatePaymentMethod = async (req, res) => {
    try {
        const { paymentMethodId } = req.body;
        const userId = req.user._id;

        if (!paymentMethodId) {
            return res.status(400).json({
                success: false,
                message: 'Payment method ID is required'
            });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.stripeCustomerId) {
            return res.status(400).json({
                success: false,
                message: 'No Stripe customer found'
            });
        }

        // ✅ STEP 1: Cancel ONLY pending authorizations (requires_capture) on old card
        // DO NOT cancel succeeded payments (already charged commissions)
        const pendingAuthorizations = await BidPayment.find({
            bidder: userId,
            type: 'bid_authorization',
            status: 'requires_capture' // ONLY this status!
        });

        console.log(`🔄 Cancelling ${pendingAuthorizations.length} PENDING authorizations for user ${userId}`);

        let cancelledCount = 0;
        for (const payment of pendingAuthorizations) {
            try {
                await StripeService.cancelPaymentIntent(payment.paymentIntentId);
                payment.status = 'canceled';
                await payment.save();
                cancelledCount++;
                console.log(`✅ Cancelled PENDING authorization for auction: ${payment.auction}`);
            } catch (error) {
                console.error(`❌ Failed to cancel authorization ${payment.paymentIntentId}:`, error.message);
            }
        }

        // ✅ STEP 2: Also mark any 'succeeded' bid_authorizations as 'replaced'
        // These are the old $2500 authorizations that were replaced by final commissions
        const succeededAuthorizations = await BidPayment.find({
            bidder: userId,
            type: 'bid_authorization', 
            status: 'succeeded'
        });

        for (const payment of succeededAuthorizations) {
            payment.status = 'replaced'; // Mark as replaced for clarity
            await payment.save();
            console.log(`📝 Marked succeeded authorization as replaced for auction: ${payment.auction}`);
        }

        // ✅ STEP 3: Verify and update card with Stripe
        const verificationResult = await StripeService.verifyAndSaveCard(
            user.stripeCustomerId,
            paymentMethodId
        );

        if (!verificationResult.success) {
            throw new Error('Card verification failed');
        }

        const paymentMethodDetails = verificationResult.paymentMethod;

        // ✅ STEP 4: Update user in database
        user.paymentMethodId = paymentMethodDetails.id;
        user.cardLast4 = paymentMethodDetails.last4;
        user.cardBrand = paymentMethodDetails.brand;
        user.cardExpMonth = paymentMethodDetails.expMonth;
        user.cardExpYear = paymentMethodDetails.expYear;
        user.isPaymentVerified = true;

        await user.save();

        const updatedCardInfo = {
            last4: user.cardLast4,
            brand: user.cardBrand,
            expMonth: user.cardExpMonth,
            expYear: user.cardExpYear
        };

        res.status(200).json({
            success: true,
            message: `Payment method updated successfully. ${cancelledCount} pending authorizations cancelled.`,
            data: {
                card: updatedCardInfo,
                isPaymentVerified: true,
                userType: user.userType,
                stripeCustomerId: user.stripeCustomerId,
                cancelledAuthorizations: cancelledCount
            }
        });

    } catch (error) {
        console.error('Update payment method error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update payment method'
        });
    }
};