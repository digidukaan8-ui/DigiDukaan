import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createOrder, verifyOrder } from '../controllers/payment.controller.js';

const paymentRouter = express.Router();

paymentRouter.post('/used-product/create-order', authMiddleware('seller'), createOrder);
paymentRouter.post('/used-product/verify', authMiddleware('seller'), verifyOrder);

export default paymentRouter;