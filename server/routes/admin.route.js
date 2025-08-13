import express from 'express'
import {verifyRole} from '../middlewares/auth.middleware.js'

const adminRouter = express.Router();

adminRouter.get('/', verifyRole('admin'),);

export default adminRouter;