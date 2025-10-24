import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './db/connection.js'
import userRouter from './routes/user.route.js';
import buyerRouter from './routes/buyer.route.js';
import sellerRouter from './routes/seller.route.js';
import adminRouter from './routes/admin.route.js';
import paymentRouter from './routes/payment.route.js';
import chatRouter from './routes/chat.route.js';
import http from "http";
import { initSocket } from "./socket.js";
//...
import productRouter from './routes/product.route.js'; // YEH LINE ADD KAREIN
//...

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/products', productRouter); // YEH LINE ADD KAREIN
//...

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.get('/', (req, res) => {
  res.send('API is running...');
});

connectDB();

app.use('/api/users', userRouter);
app.use('/api/buyers', buyerRouter);
app.use('/api/sellers', sellerRouter);
app.use('/api/admins', adminRouter);
app.use('/api/chats', chatRouter);
app.use('/api/payments', paymentRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server and WebSocket running on http://localhost:${PORT}`);
});