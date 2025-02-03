import { Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../utils/validateBody.js';

import { isValidId } from '../middlewares/index.js';
import { upload } from '../middlewares/upload.js';
import { authenticate } from '../middlewares/authenticate.js';

import { userUpdateSchema } from '../validation/user.js';

import {
  getUserByIdController,
  updateUserController,
} from '../controllers/userControllers.js';

const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/:userId', isValidId, ctrlWrapper(getUserByIdController));

userRouter.patch(
  '/:userId',
  isValidId,
  upload.single('photo'),
  validateBody(userUpdateSchema),
  ctrlWrapper(updateUserController),
);

export default userRouter;
