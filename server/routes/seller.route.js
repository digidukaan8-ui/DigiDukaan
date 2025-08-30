import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { handleCreateStore, handleDeliveryZone } from '../middlewares/store.middleware.js';
import { uploadProductMedia, validateFileSizes } from '../middlewares/upload.middleware.js';
import { createStore, addDeliveryZone } from '../controllers/store.controller.js';
import { handleAddProduct } from '../middlewares/product.middleware.js';
import { addProduct, getProduct } from '../controllers/product.controller.js';

const sellerRouter = express.Router();

sellerRouter.post('/createStore', authMiddleware('seller'), uploadProductMedia, validateFileSizes, handleCreateStore, createStore);

sellerRouter.get('/:storeId/products', authMiddleware('seller'), getProduct);
sellerRouter.post('/addProduct', authMiddleware('seller'), uploadProductMedia, validateFileSizes, handleAddProduct, addProduct);

sellerRouter.post('/addDeliveryZone', authMiddleware('seller'), handleDeliveryZone, addDeliveryZone);

export default sellerRouter;