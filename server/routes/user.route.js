import express from 'express';
import { handleLogin, handleRegister } from '../middlewares/user.middleware.js';
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.post('/register', handleRegister, registerUser);
userRouter.post('/login', handleLogin, loginUser);
userRouter.get('/logout', logoutUser);

export default userRouter;