import express from 'express';
import { addMessage, getChatMessages, getChats, updateMessage, removeMessage } from '../controllers/chat.controller.js';
import { uploadChatMedia, validateChatFileSize } from '../middlewares/chatUpload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const chatRouter = express.Router();

chatRouter.get('/', authMiddleware('buyer', 'seller'), getChats);
chatRouter.post('/add', authMiddleware('buyer', 'seller'), validateChatFileSize, uploadChatMedia, addMessage);
chatRouter.get('/messages/:chatId', authMiddleware('buyer', 'seller'), getChatMessages);
chatRouter.put('/messages/:messageId', authMiddleware('buyer', 'seller'), updateMessage);
chatRouter.delete('/messages/:messageId', authMiddleware('buyer', 'seller'), removeMessage);

export default chatRouter;