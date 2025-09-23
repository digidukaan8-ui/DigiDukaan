import express from 'express';
import { addMessage, getChatMessages, getChats } from '../controllers/chat.controller.js';
import { uploadChatMedia, validateChatFileSize } from '../middlewares/chatUpload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const chatRouter = express.Router();

chatRouter.get('/', authMiddleware('buyer', 'seller'), getChats);
chatRouter.post('/add', authMiddleware('buyer', 'seller'), uploadChatMedia, validateChatFileSize, addMessage);
chatRouter.get('/messages/:chatId', authMiddleware('buyer', 'seller'), getChatMessages);

export default chatRouter;