import express from 'express'
import { verifyRole } from '../middlewares/auth.middleware.js'
import { handleCreateStore, handleAddCategory } from '../middlewares/store.middleware.js';
import { uploadSingleImage, uploadMultipleImages } from '../middlewares/uploadImg.middleware.js';
import { createStore, addCategory } from '../controllers/store.controller.js';

const sellerRouter = express.Router();

sellerRouter.post('/createStore', verifyRole('seller'), uploadSingleImage, handleCreateStore, createStore);
sellerRouter.post('/addCategory', verifyRole('seller'), uploadSingleImage, handleAddCategory, addCategory);

export default sellerRouter;