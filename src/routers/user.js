import { Router } from "express";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";
import * as contactsController from "../controllers/userControllers.js";
import { upload } from "../middlewares/upload.js";

import { validateBody } from "../utils/validateBody.js";
import { contactAddSchema, contactUpdateSchema } from "../validation/user.js";

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const userRouter = Router();

// contactsController.use(authenticate);

userRouter.get('/', authenticate, ctrlWrapper(contactsController.getContactsController));

userRouter.get('/:contactId', authenticate, isValidId, ctrlWrapper(contactsController.getContactByIdController));

userRouter.post('/', upload.single('photo'), authenticate, validateBody(contactAddSchema), ctrlWrapper(contactsController.addContactController));

userRouter.patch('/:contactId', upload.single('photo'), authenticate, isValidId, validateBody(contactUpdateSchema), ctrlWrapper(contactsController.patchContactController));

userRouter.delete('/:contactId', authenticate, isValidId, ctrlWrapper(contactsController.deleteContactController));

export default userRouter;

