import { Router } from "express";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";
import * as contactsController from "../controllers/contacts.js";
import { upload } from "../middlewares/upload.js";

import { validateBody } from "../utils/validateBody.js";
import { contactAddSchema, contactUpdateSchema } from "../validation/contacts.js";

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

// contactsController.use(authenticate);

router.get('/', authenticate, ctrlWrapper(contactsController.getContactsController));

router.get('/:contactId', authenticate, isValidId, ctrlWrapper(contactsController.getContactByIdController));

router.post('/', upload.single('photo'), authenticate, validateBody(contactAddSchema), ctrlWrapper(contactsController.addContactController));

router.patch('/:contactId', upload.single('photo'), authenticate, isValidId, validateBody(contactUpdateSchema), ctrlWrapper(contactsController.patchContactController));

router.delete('/:contactId', authenticate, isValidId, ctrlWrapper(contactsController.deleteContactController));

export default router;

