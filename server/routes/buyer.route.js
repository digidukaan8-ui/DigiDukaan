import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const buyerRouter = express.Router();

buyerRouter.get('/', authMiddleware('buyer'),);

export default buyerRouter;