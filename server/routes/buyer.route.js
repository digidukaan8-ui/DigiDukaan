import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import {
    getViewedProducts, getWishlistProducts, getCartProducts, getReview,
    addViewedProduct, addWishlistProduct, addCartProduct, addReview,
    removeViewedProduct, removeWishlistProduct, removeCartProduct, removeReview,
    updateReview
} from '../controllers/product.controller.js';

const buyerRouter = express.Router();

buyerRouter.get('/products/viewed', authMiddleware('buyer'), getViewedProducts);
buyerRouter.get('/products/wishlist', authMiddleware('buyer'), getWishlistProducts);
buyerRouter.get('/products/cart', authMiddleware('buyer'), getCartProducts);
buyerRouter.get('/products/reviews', authMiddleware('buyer'), getReview);

buyerRouter.post('/products/:productId/viewed', authMiddleware('buyer'), addViewedProduct);
buyerRouter.post('/products/:productId/wishlist', authMiddleware('buyer'), addWishlistProduct);
buyerRouter.post('/products/:productId/cart', authMiddleware('buyer'), addCartProduct);
buyerRouter.post('/products/:productId/review', authMiddleware('buyer'), addReview);

buyerRouter.put('/products/review/:reviewId', authMiddleware('buyer'), updateReview);

buyerRouter.delete('/products/:productId/viewed', authMiddleware('buyer'), removeViewedProduct);
buyerRouter.delete('/products/:productId/wishlist', authMiddleware('buyer'), removeWishlistProduct);
buyerRouter.delete('/products/:productId/cart', authMiddleware('buyer'), removeCartProduct);
buyerRouter.delete('/products/review/:reviewId', authMiddleware('buyer'), removeReview);

export default buyerRouter;