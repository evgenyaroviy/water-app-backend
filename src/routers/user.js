import express from 'express';

import {
  getUserByIdController,
  updateUserController,
} from '../controllers/userControllers.js';

import { authenticate } from '../middlewares/authenticate.js';

const userRouter = express.Router();

userRouter.use(authenticate);

userRouter.get('/', getUserByIdController);
userRouter.patch('/', updateUserController);

export default userRouter;
