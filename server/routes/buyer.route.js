import express from 'express'
import {verifyRole} from '../middlewares/auth.middleware.js'

const buyerRouter = express.Router();

buyerRouter.get('/', verifyRole('buyer'),);

export default buyerRouter;