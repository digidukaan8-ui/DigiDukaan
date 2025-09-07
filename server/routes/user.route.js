import express from 'express';
import { handleLogin, handleRegister, handleMessage } from '../middlewares/user.middleware.js';
import { loginUser, logoutUser, registerUser, sendOTP, verifyOTP, resetPassword, message } from '../controllers/user.controller.js';
import { getProducts } from '../controllers/product.controller.js';
import handleLocationAccess from '../middlewares/location.middleware.js';
import openStreetMap from '../controllers/location.controller.js';

const userRouter = express.Router();

userRouter.post('/register', handleRegister, registerUser);
userRouter.post('/login', handleLogin, loginUser);
userRouter.get('/logout', logoutUser);

userRouter.post('/send-otp', sendOTP);
userRouter.post('/verify-otp', verifyOTP);
userRouter.put('/reset-password', resetPassword);

userRouter.get('/reverse-geocode/:lat/:lon', handleLocationAccess, openStreetMap);

userRouter.post('/contact', handleMessage, message);

userRouter.post('/products', getProducts);

export default userRouter;