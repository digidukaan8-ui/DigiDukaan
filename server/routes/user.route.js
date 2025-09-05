import express from 'express';
import { handleLogin, handleRegister } from '../middlewares/user.middleware.js';
import { loginUser, logoutUser, registerUser, sendOTP, verifyOTP, resetPassword } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.post('/register', handleRegister, registerUser);
userRouter.post('/login', handleLogin, loginUser);
userRouter.get('/logout', logoutUser);
userRouter.post('/send-otp', sendOTP);
userRouter.post('/verify-otp', verifyOTP);
userRouter.put('/reset-password', resetPassword);

export default userRouter;