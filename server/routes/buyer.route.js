import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import {
    getViewedProducts, getWishlistProducts, getCartProducts, getReview,
    addViewedProduct, addWishlistProduct, addCartProduct, addReview,
    removeViewedProduct, removeWishlistProduct, removeCartProduct, removeReview,
    updateCart, updateReview,
    getProductById
} from '../controllers/product.controller.js';
import { handleAddToCart, handleUpdateCart } from '../middlewares/product.middleware.js';

const buyerRouter = express.Router();

buyerRouter.get('/cart', authMiddleware('buyer'), getCartProducts);
buyerRouter.get('/wishlist', authMiddleware('buyer'), getWishlistProducts);
buyerRouter.get('/viewed', authMiddleware('buyer'), getViewedProducts);
buyerRouter.get('/reviews', authMiddleware('buyer'), getReview);
buyerRouter.get('/product/:productId', authMiddleware('buyer'), getProductById);

buyerRouter.post('/cart/:productId', authMiddleware('buyer'), handleAddToCart, addCartProduct);
buyerRouter.post('/wishlist/:productId', authMiddleware('buyer'), addWishlistProduct);
buyerRouter.post('/viewed/:productId', authMiddleware('buyer'), addViewedProduct);
buyerRouter.post('/review/:productId', authMiddleware('buyer'), addReview);

buyerRouter.put('/cart/:cartId', authMiddleware('buyer'), handleUpdateCart, updateCart);
buyerRouter.put('/review/:reviewId', authMiddleware('buyer'), updateReview);

buyerRouter.delete('/cart/:cartId', authMiddleware('buyer'), removeCartProduct);
buyerRouter.delete('/wishlist/:productId', authMiddleware('buyer'), removeWishlistProduct);
buyerRouter.delete('/viewed/:productId', authMiddleware('buyer'), removeViewedProduct);
buyerRouter.delete('/review/:reviewId', authMiddleware('buyer'), removeReview);

export default buyerRouter;