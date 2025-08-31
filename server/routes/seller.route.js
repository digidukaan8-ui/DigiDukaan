import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { handleCreateStore, handleUpdateStore, handleDeliveryZone, handleUpdateDeliveryZone } from '../middlewares/store.middleware.js';
import { uploadProductMedia, validateFileSizes } from '../middlewares/upload.middleware.js';
import { createStore, updateStore, addDeliveryZone, updateDeliveryZone, removeDeliveryZone } from '../controllers/store.controller.js';
import { handleAddProduct } from '../middlewares/product.middleware.js';
import { addProduct, getProduct } from '../controllers/product.controller.js';

const sellerRouter = express.Router();

sellerRouter.post('/createStore', authMiddleware('seller'), uploadProductMedia, validateFileSizes, handleCreateStore, createStore);
sellerRouter.patch('/updateStore', authMiddleware('seller'), uploadProductMedia, validateFileSizes, handleUpdateStore, updateStore);

sellerRouter.get('/:storeId/products', authMiddleware('seller'), getProduct);
sellerRouter.post('/addProduct', authMiddleware('seller'), uploadProductMedia, validateFileSizes, handleAddProduct, addProduct);

sellerRouter.post('/addDeliveryZone', authMiddleware('seller'), handleDeliveryZone, addDeliveryZone);
sellerRouter.patch('/updateDeliveryZone', authMiddleware('seller'), handleUpdateDeliveryZone, updateDeliveryZone);
sellerRouter.delete('/removeDeliveryZone', authMiddleware('seller'), removeDeliveryZone);

export default sellerRouter;