import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema({
    // Basic Info
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
        lowercase: true,
        validate: {
            validator: function (email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: true
    },

    // User Type
    userType: {
        type: String,
        enum: ['bidder', 'seller'],
        required: true
    },

    // Additional Info
    countryCode: {
        type: String,
        required: true,
        trim: true
    },
    countryName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true },
        country: { type: String, trim: true }
    },
    preferences: {
        bidAlerts: { type: Boolean, default: true },
        outbidNotifications: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: true },
        smsUpdates: { type: Boolean, default: false },
        favoriteCategories: [{ type: String }]
    },

    // Stripe Payment Info (For Bidders Only)
    stripeCustomerId: {
        type: String,
        sparse: true
    },
    paymentMethodId: {
        type: String,
        sparse: true
    },
    cardLast4: {
        type: String,
        trim: true
    },
    cardBrand: {
        type: String,
        trim: true
    },
    cardExpMonth: {
        type: Number
    },
    cardExpYear: {
        type: Number
    },

    // Payment status
    isPaymentVerified: {
        type: Boolean,
        default: false
    },

    // Account Status
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // Tokens
    refreshToken: {
        type: String,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordTokenExpiry: {
        type: Date,
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationExpiry: {
        type: Date,
    }
}, { timestamps: true });

// Index for better query performance
userSchema.index({ userType: 1, email: 1 });
// userSchema.index({ stripeCustomerId: 1 }, { sparse: true });

// Pre-save middleware for password hashing
userSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10);
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Method to validate password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Token generation methods
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            userType: this.userType
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );
};

userSchema.methods.generateResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    return resetToken;
};

// Method to get user data without sensitive information
userSchema.methods.toSafeObject = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.refreshToken;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordTokenExpiry;
    delete userObject.emailVerificationToken;
    delete userObject.emailVerificationExpiry;
    return userObject;
};

const User = model('User', userSchema);

export default User;