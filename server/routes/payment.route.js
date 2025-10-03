import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createOrder, verifyOrder } from '../controllers/payment.controller.js';
import { handleAddOrder } from '../middlewares/order.middleware.js';
import { addOrder, verifyOrderPayment } from '../controllers/order.controller.js';

const paymentRouter = express.Router();

paymentRouter.post('/used-product/create-order', authMiddleware('seller'), createOrder);
paymentRouter.post('/used-product/verify', authMiddleware('seller'), verifyOrder);

paymentRouter.post('/order', authMiddleware('buyer'), handleAddOrder, addOrder);
paymentRouter.get('/verify/:orderId', authMiddleware('buyer'), verifyOrderPayment);


export default paymentRouter;