import express from 'express';
import { validateBody } from '../utils/validateBody.js';
import { schemas } from '../Shemas/water.js';
import { waterController } from '../controllers/water.js';
import {
  authenticate,
 
  isValidateMonth,
} from '../middlewares/index.js';

const waterRouter = express.Router();

waterRouter.use(authenticate);


waterRouter.get('/', waterController.getAllWater);
waterRouter.post('/', waterController.addWater);
waterRouter.put('/:waterId', waterController.updateWater);
waterRouter.delete('/:waterId', waterController.deleteWater);

waterRouter.get('/today', waterController.getTodayStats);
waterRouter.get(
  '/month/:date',
  isValidateMonth,
  waterController.getMonthlyStats,
);
waterRouter.patch(
  '/daily-norm',
  validateBody(schemas.updateDailyNormSchema),
  waterController.updateDailyNorm,
);

export default waterRouter;
