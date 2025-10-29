import express from "express";
import {
    getBestRatedProducts, getMostViewedProducts, getRelatedProducts, getSimilarProducts, getBestSellers,
    getSimilarBrandProducts, getSimilarBrandUsedProducts, getSimilarUsedProducts, getRelatedUsedProducts
} from '../controllers/recommendation.controller.js';

const recommendRouter = express.Router();

recommendRouter.get('/products/similar-product/:productId/:location', getSimilarProducts);
recommendRouter.get('/products/related-product/:productId/:location', getRelatedProducts);
recommendRouter.get('/products/similar-brand-product/:productId/:location', getSimilarBrandProducts);

recommendRouter.get('/products/similar-used-product/:productId/:location', getSimilarUsedProducts);
recommendRouter.get('/products/related-used-product/:productId/:location', getRelatedUsedProducts);
recommendRouter.get('/products/similar-brand-used-product/:productId/:location', getSimilarBrandUsedProducts);

recommendRouter.get('/products/best-rated/:location', getBestRatedProducts);
recommendRouter.get('/products/most-viewed/:location', getMostViewedProducts);
recommendRouter.get('/products/best-seller/:location', getBestSellers);

export default recommendRouter;