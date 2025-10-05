import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const auth = async (req, res, next) => {
    try {
        // Get token from cookies OR Authorization header
        const token = req.cookies?.accessToken ||
            req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'You need to login first'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find user by ID from token
        const user = await User.findById(decoded.id).select('-password -refreshToken');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid access token - user not found'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid access token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access token expired'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication'
        });
    }
};

// Optional: Middleware to check user type
export const requireSeller = (req, res, next) => {
    if (req.user.userType !== 'seller') {
        return res.status(403).json({
            success: false,
            message: 'Seller access required'
        });
    }
    next();
};

export const requireBidder = (req, res, next) => {
    if (req.user.userType !== 'bidder') {
        return res.status(403).json({
            success: false,
            message: 'Bidder access required'
        });
    }
    next();
};

export const requireAdmin = (req, res, next) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Combined middleware for specific user types
export const authSeller = [auth, requireSeller];
export const authBidder = [auth, requireBidder];
export const authAdmin = [auth, requireAdmin];

// Optional: Soft auth middleware (attaches user if available, but doesn't require auth)
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken ||
            req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.id).select('-password -refreshToken');

            if (user && user.isActive) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        // Continue without user if token is invalid
        next();
    }
};