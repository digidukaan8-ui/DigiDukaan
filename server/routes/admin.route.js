import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const adminRouter = express.Router();

adminRouter.get('/', authMiddleware('admin'),);

export default adminRouter;