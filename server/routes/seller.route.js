import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { handleCreateStore } from '../middlewares/store.middleware.js';
import { uploadSingleImage, uploadMultipleImages } from '../middlewares/uploadImg.middleware.js';
import { createStore } from '../controllers/store.controller.js';

const sellerRouter = express.Router();

sellerRouter.post('/createStore', authMiddleware('seller'), uploadSingleImage, handleCreateStore, createStore);

export default sellerRouter;