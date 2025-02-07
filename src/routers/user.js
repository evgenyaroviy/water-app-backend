import express from 'express';

import {
  getUserByIdController,
  updateUserController,
} from '../controllers/userControllers.js';

import { upload } from '../middlewares/upload.js';

import { authenticate } from '../middlewares/authenticate.js';

const userRouter = express.Router();

userRouter.use(authenticate);

userRouter.get('/', getUserByIdController);
userRouter.patch('/', upload.single('photo'), updateUserController);

export default userRouter;
