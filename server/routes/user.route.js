import express from 'express';
import { hadleLogin, handleRegister } from '../middlewares/user.middleware.js';
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.post('/register', handleRegister, registerUser);
userRouter.post('/login', hadleLogin, loginUser);
userRouter.get('/logout', logoutUser);

export default userRouter;