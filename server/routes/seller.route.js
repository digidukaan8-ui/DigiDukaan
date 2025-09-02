import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { handleCreateStore, handleUpdateStore, handleDeliveryZone, handleUpdateDeliveryZone } from '../middlewares/store.middleware.js';
import { uploadProductMedia, validateFileSizes } from '../middlewares/upload.middleware.js';
import { createStore, updateStore, addDeliveryZone, updateDeliveryZone, removeDeliveryZone } from '../controllers/store.controller.js';
import { handleAddProduct, handleUpdateProduct } from '../middlewares/product.middleware.js';
import { addProduct, getProduct, updateProduct, removeProduct } from '../controllers/product.controller.js';

const sellerRouter = express.Router();

sellerRouter.post('/stores', authMiddleware('seller'), uploadProductMedia, validateFileSizes, handleCreateStore, createStore);
sellerRouter.patch('/stores/:storeId', authMiddleware('seller'), uploadProductMedia, validateFileSizes, handleUpdateStore, updateStore);

sellerRouter.get('/stores/:storeId/products', authMiddleware('seller'), getProduct);
sellerRouter.post('/stores/:storeId/products', authMiddleware('seller'), uploadProductMedia, validateFileSizes, handleAddProduct, addProduct);
sellerRouter.patch('/products/:productId', authMiddleware('seller'), uploadProductMedia, validateFileSizes, handleUpdateProduct, updateProduct);
sellerRouter.delete('/products/:productId', authMiddleware('seller'), removeProduct);

sellerRouter.post('/stores/:storeId/delivery-zones', authMiddleware('seller'), handleDeliveryZone, addDeliveryZone);
sellerRouter.patch('/delivery-zones/:zoneId', authMiddleware('seller'), handleUpdateDeliveryZone, updateDeliveryZone);
sellerRouter.delete('/delivery-zones/:zoneId', authMiddleware('seller'), removeDeliveryZone);

export default sellerRouter;