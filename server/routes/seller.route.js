import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { handleCreateStore, handleUpdateStore, handleDeliveryZone, handleUpdateDeliveryZone } from '../middlewares/store.middleware.js';
import { uploadProductMedia, validateFileSizes } from '../middlewares/upload.middleware.js';
import { createStore, updateStore, addDeliveryZone, updateDeliveryZone, removeDeliveryZone, getStoreInfo } from '../controllers/store.controller.js';
import { handleAddProduct, handleUpdateProduct, handleAddUsedProduct, handleUpdateUsedProduct } from '../middlewares/product.middleware.js';
import { addProduct, getProduct, updateProduct, removeProduct, changeAvailability, addUsedProduct, getUsedProduct, updateUsedProduct, removeUsedProduct } from '../controllers/product.controller.js';
import { updateOrderStatus } from '../controllers/order.controller.js';
import { getSellerIncomeSummary, requestWithdrawal } from '../controllers/payment.controller.js';

const sellerRouter = express.Router();

sellerRouter.get('/stores/:storeId/info', authMiddleware('seller'), getStoreInfo);

sellerRouter.post('/stores', authMiddleware('seller'), validateFileSizes, uploadProductMedia, handleCreateStore, createStore);
sellerRouter.patch('/stores/:storeId', authMiddleware('seller'), validateFileSizes, uploadProductMedia, handleUpdateStore, updateStore);

sellerRouter.post('/stores/:storeId/delivery-zones', authMiddleware('seller'), handleDeliveryZone, addDeliveryZone);
sellerRouter.patch('/delivery-zones/:zoneId', authMiddleware('seller'), handleUpdateDeliveryZone, updateDeliveryZone);
sellerRouter.delete('/delivery-zones/:zoneId', authMiddleware('seller'), removeDeliveryZone);

sellerRouter.get('/stores/:storeId/products', authMiddleware('seller'), getProduct);
sellerRouter.post('/stores/:storeId/products', authMiddleware('seller'), validateFileSizes, uploadProductMedia, handleAddProduct, addProduct);
sellerRouter.patch('/products/:productId', authMiddleware('seller'), validateFileSizes, uploadProductMedia, handleUpdateProduct, updateProduct);
sellerRouter.delete('/products/:productId', authMiddleware('seller'), removeProduct);
sellerRouter.patch('/products/:productId/availability', authMiddleware('seller'), changeAvailability);

sellerRouter.get('/stores/:storeId/used-products', authMiddleware('seller'), getUsedProduct);
sellerRouter.post('/stores/:storeId/used-products', authMiddleware('seller'), validateFileSizes, uploadProductMedia, handleAddUsedProduct, addUsedProduct);
sellerRouter.patch('/used-products/:usedProductId', authMiddleware('seller'), validateFileSizes, uploadProductMedia, handleUpdateUsedProduct, updateUsedProduct);
sellerRouter.delete('/used-products/:usedProductId', authMiddleware('seller'), removeUsedProduct);

sellerRouter.put('/orders/status/:orderId', authMiddleware('seller'), updateOrderStatus);

sellerRouter.get('/revenue/:storeId', authMiddleware('seller'), getSellerIncomeSummary);

sellerRouter.post('/withdraw/:storeId', authMiddleware('seller'), requestWithdrawal);

export default sellerRouter;