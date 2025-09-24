import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import {
    getViewedProducts, getWishlistProducts, getCartProducts, getReview,
    addViewedProduct, addWishlistProduct, addCartProduct, addReview,
    removeViewedProduct, removeWishlistProduct, removeCartProduct, removeReview,
    updateCart, updateReview
} from '../controllers/product.controller.js';
import { userAvatar, removeUserAvatar, updateProfile } from '../controllers/user.controller.js';
import { handleAddToCart, handleUpdateCart } from '../middlewares/product.middleware.js';
import { uploadProductMedia, validateFileSizes } from '../middlewares/upload.middleware.js';
import { addAddress, updateAddress, removeAddress, getAddresses } from '../controllers/address.controller.js';
import { handleAddAddress, handleUpdateAddress } from '../middlewares/address.middleware.js';
const buyerRouter = express.Router();

buyerRouter.get('/cart', authMiddleware('buyer'), getCartProducts);
buyerRouter.get('/wishlist', authMiddleware('buyer'), getWishlistProducts);
buyerRouter.get('/viewed', authMiddleware('buyer'), getViewedProducts);
buyerRouter.get('/reviews', authMiddleware('buyer'), getReview);
buyerRouter.get('/addresses', authMiddleware('buyer'), getAddresses);

buyerRouter.post('/cart/:productId', authMiddleware('buyer'), handleAddToCart, addCartProduct);
buyerRouter.post('/wishlist/:productId', authMiddleware('buyer'), addWishlistProduct);
buyerRouter.post('/viewed/:productId', authMiddleware('buyer'), addViewedProduct);
buyerRouter.post('/review/:productId', authMiddleware('buyer'), addReview);
buyerRouter.post('/address', authMiddleware('buyer'), handleAddAddress, addAddress);

buyerRouter.put('/cart/:cartId', authMiddleware('buyer'), handleUpdateCart, updateCart);
buyerRouter.put('/review/:reviewId', authMiddleware('buyer'), updateReview);
buyerRouter.put('/avatar', authMiddleware('buyer'), validateFileSizes, uploadProductMedia, userAvatar);
buyerRouter.put('/update', authMiddleware('buyer'), updateProfile);
buyerRouter.put('/address/:addressId', authMiddleware('buyer'), handleUpdateAddress, updateAddress);

buyerRouter.delete('/cart/:cartId', authMiddleware('buyer'), removeCartProduct);
buyerRouter.delete('/wishlist/:wishlistId/:productId', authMiddleware('buyer'), removeWishlistProduct);
buyerRouter.delete('/viewed/:viewId/:productId', authMiddleware('buyer'), removeViewedProduct);
buyerRouter.delete('/review/:reviewId', authMiddleware('buyer'), removeReview);
buyerRouter.delete('/avatar', authMiddleware('buyer'), removeUserAvatar);
buyerRouter.delete('/address/:addressId', authMiddleware('buyer'), removeAddress);

export default buyerRouter;