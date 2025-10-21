import express from 'express';
import { searchProducts, getProductById } from '../controllers/product.controller.js';

const router = express.Router();

router.get('/search', searchProducts);
router.get('/:id', getProductById);

export default router;