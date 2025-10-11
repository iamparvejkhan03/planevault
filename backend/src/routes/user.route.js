import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { 
    forgotPassword,
    getBillingInfo,
    loginUser, 
    refreshAccessToken, 
    registerUser,
    resetPassword,
    updatePaymentMethod,
} from "../controllers/user.controller.js";

import {
    getProfile,
    updateProfile,
    changePassword,
    updatePreferences,
    getUserStats,
} from "../controllers/profile.controller.js";

import { auth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// Public routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/refresh-token', refreshAccessToken);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password/:token', resetPassword);

// Protected routes
userRouter.get('/profile', auth, getProfile);
userRouter.put('/profile', auth, upload.single('image'), updateProfile);
userRouter.put('/change-password', auth, changePassword);
userRouter.put('/preferences', auth, updatePreferences);
userRouter.get('/stats/:userType', auth, getUserStats);
userRouter.get('/billing', auth, getBillingInfo);
userRouter.put('/billing/update-card', auth, updatePaymentMethod);

export default userRouter;