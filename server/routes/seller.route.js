import express from 'express'
import {verifyRole} from '../middlewares/auth.middleware.js'

const sellerRouter = express.Router();

sellerRouter.get('/', verifyRole('seller'),);

export default sellerRouter;