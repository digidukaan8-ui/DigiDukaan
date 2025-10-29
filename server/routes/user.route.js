import express from 'express';
import rateLimit from 'express-rate-limit';
import { handleLogin, handleRegister, handleMessage } from '../middlewares/user.middleware.js';
import { loginUser, logoutUser, registerUser, sendOTP, verifyOTP, resetPassword, message } from '../controllers/user.controller.js';
import { getProducts, getProductByCategory, getProductById } from '../controllers/product.controller.js';
import handleLocationAccess from '../middlewares/location.middleware.js';
import reverseGeocode from '../controllers/location.controller.js';
import { userAvatar, removeUserAvatar, updateProfile } from '../controllers/user.controller.js';
import { uploadProductMedia, validateFileSizes } from '../middlewares/upload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const userRouter = express.Router();

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many register attempts, try again later" },
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many login attempts, try again later" },
});

const otpIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many OTP requests from this IP, try again later" },
});

const otpUserLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1,
    message: { success: false, message: "Please wait 1 minute before requesting another OTP" },
    keyGenerator: (req) => req.body.email,
});

const verifyOtpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many wrong attempts, try again later" }
});

const locationLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many location request, try again later" }
});

const messageLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many messages, try again later" }
});

const productsLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many product requests, slow down" }
});

userRouter.post('/register', registerLimiter, handleRegister, registerUser);
userRouter.post('/login', loginLimiter, handleLogin, loginUser);
userRouter.get('/logout', logoutUser);

userRouter.post('/send-otp', otpIpLimiter, otpUserLimiter, sendOTP);
userRouter.post('/verify-otp', verifyOtpLimiter, verifyOTP);
userRouter.put('/reset-password', resetPassword);

userRouter.get('/reverse-geocode/:lat/:lon', locationLimiter, handleLocationAccess, reverseGeocode);

userRouter.post('/contact', messageLimiter, handleMessage, message);

userRouter.get('/products/:location', productsLimiter, getProducts);
userRouter.get('/product/:productId', productsLimiter, getProductById);
userRouter.get('/category-products/:category', productsLimiter, getProductByCategory);

userRouter.put('/update', authMiddleware('buyer','seller'), updateProfile);
userRouter.put('/avatar', authMiddleware('buyer','seller'), validateFileSizes, uploadProductMedia, userAvatar);
userRouter.delete('/avatar', authMiddleware('buyer','seller'), removeUserAvatar);

export default userRouter;