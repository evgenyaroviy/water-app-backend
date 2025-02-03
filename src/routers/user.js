import express from 'express';
import {
  getUserByIdController,
  updateUserController,
} from '../controllers/userControllers.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.use(authenticate); // Защищаем все маршруты

router.get('/:userId', getUserByIdController);
router.put('/:userId', updateUserController);

export default router;
