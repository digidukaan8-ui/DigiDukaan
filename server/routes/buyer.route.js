import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
    getViewedProducts, getWishlistProducts, getCartProducts, getReview, getProductReviews,
    addViewedProduct, addWishlistProduct, addCartProduct, addReview,
    removeViewedProduct, removeWishlistProduct, removeCartProduct, removeReview,
    updateCart, updateReview
} from '../controllers/product.controller.js';
import { handleAddToCart, handleUpdateCart, uploadMedia, validateMediaSize, handleAddReview, handleUpdateReview } from '../middlewares/product.middleware.js';
import { addAddress, updateAddress, removeAddress, getAddresses } from '../controllers/address.controller.js';
import { handleAddAddress, handleUpdateAddress } from '../middlewares/address.middleware.js';
import { getStoreDeliveryCharge } from '../controllers/store.controller.js';
import { cancelOrder, getOrders, getOrdersCount } from '../controllers/order.controller.js';

const buyerRouter = express.Router();

buyerRouter.get('/cart', authMiddleware('buyer'), getCartProducts);
buyerRouter.get('/wishlist', authMiddleware('buyer'), getWishlistProducts);
buyerRouter.get('/viewed', authMiddleware('buyer'), getViewedProducts);
buyerRouter.get('/review/:productId', authMiddleware('buyer'), getReview);
buyerRouter.get('/products/reviews/:productId', authMiddleware('buyer'), getProductReviews);
buyerRouter.get('/addresses', authMiddleware('buyer'), getAddresses);
buyerRouter.get('/orders', authMiddleware('buyer', 'seller'), getOrders);
buyerRouter.get('/orders/count', authMiddleware('buyer', 'seller'), getOrdersCount);

buyerRouter.post('/cart/:productId', authMiddleware('buyer'), handleAddToCart, addCartProduct);
buyerRouter.post('/wishlist/:productId', authMiddleware('buyer'), addWishlistProduct);
buyerRouter.post('/viewed/:productId', authMiddleware('buyer'), addViewedProduct);
buyerRouter.post('/review', authMiddleware('buyer'), uploadMedia, validateMediaSize, handleAddReview, addReview);
buyerRouter.post('/address', authMiddleware('buyer'), handleAddAddress, addAddress);
buyerRouter.post('/store/deliveryCharge', authMiddleware('buyer'), getStoreDeliveryCharge);

buyerRouter.put('/cart/:cartId', authMiddleware('buyer'), handleUpdateCart, updateCart);
buyerRouter.put('/review/:reviewId', authMiddleware('buyer'), uploadMedia, validateMediaSize, handleUpdateReview, updateReview);
buyerRouter.put('/address/:addressId', authMiddleware('buyer'), handleUpdateAddress, updateAddress);
buyerRouter.put('/orders/cancel/:orderId', authMiddleware('buyer'), cancelOrder);

buyerRouter.delete('/cart/:cartId', authMiddleware('buyer'), removeCartProduct);
buyerRouter.delete('/wishlist/:wishlistId/:productId', authMiddleware('buyer'), removeWishlistProduct);
buyerRouter.delete('/viewed/:viewId/:productId', authMiddleware('buyer'), removeViewedProduct);
buyerRouter.delete('/review/:reviewId', authMiddleware('buyer'), removeReview);
buyerRouter.delete('/address/:addressId', authMiddleware('buyer'), removeAddress);

export default buyerRouter;