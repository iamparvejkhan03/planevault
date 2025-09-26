import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { loginUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/refresh-token', refreshAccessToken);
// userRouter.post('/forgot-password', forgotPassword);
// userRouter.post('/reset-password/:token', resetPassword);
// userRouter.get('/logout', verifyUser, logOutUser);
// userRouter.get('/refresh-access-token', refreshAccessToken);
// userRouter.get('/all', verifyAdmin, getAllUsers);
// userRouter.get('/single/:userId', getAUser);
// userRouter.delete('/delete/:userId', verifyAdmin, deleteUser);
// userRouter.patch('/update', verifyUser, upload.any(), updateUser);

export default userRouter;