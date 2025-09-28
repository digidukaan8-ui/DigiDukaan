import express from 'express';
import { addMessage, getChatMessages, getChats, updateMessage, removeMessage, markMessageSeen, markAllMessagesSeen } from '../controllers/chat.controller.js';
import { uploadChatMedia, validateChatFileSize } from '../middlewares/chatUpload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const chatRouter = express.Router();

chatRouter.get('/', authMiddleware('buyer', 'seller'), getChats);
chatRouter.post('/add', authMiddleware('buyer', 'seller'), validateChatFileSize, uploadChatMedia, addMessage);
chatRouter.get('/messages/:chatId', authMiddleware('buyer', 'seller'), getChatMessages);
chatRouter.put('/messages/:messageId', authMiddleware('buyer', 'seller'), updateMessage);
chatRouter.delete('/messages/:messageId', authMiddleware('buyer', 'seller'), removeMessage);
chatRouter.put('/messages/seen/:chatId', authMiddleware('buyer', 'seller'), markAllMessagesSeen);
chatRouter.put('/messages/:messageId/seen', authMiddleware('buyer', 'seller'), markMessageSeen);

export default chatRouter;