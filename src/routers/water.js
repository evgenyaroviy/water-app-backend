import express from 'express';
import { validateBody } from '../utils/validateBody.js';
import { schemas } from '../Shemas/water.js';
import { waterController } from '../controllers/water.js';
import {
  authenticate,
  isValidId,
  isValidateMonth,
} from '../middlewares/index.js';

const waterRouter = express.Router();

const routes = {
  addEntry: '/add',
  updateEntry: '/update/:entryId',
  deleteEntry: '/:entryId',
  dailyStats: '/today',
  monthlyStats: '/month/:date',
};

//Add water
waterRouter.post(
  routes.addEntry,
  authenticate,
  validateBody(schemas.entriesWaterSchemas),
  waterController.addWater,
);

//Update water
waterRouter.put(
  routes.updateEntry,
  authenticate,
  isValidId,
  validateBody(schemas.updateWaterSchemas),
  waterController.updateWater,
);

//Delete water
waterRouter.delete(
  routes.deleteEntry,
  authenticate,
  isValidId,
  waterController.deleteWater,
);

//Get water today
waterRouter.get(routes.dailyStats, authenticate, waterController.getTodayStats);

//Get water month
waterRouter.get(
  routes.monthlyStats,
  authenticate,
  isValidateMonth,
  waterController.getMonthlyStats,
);

export default waterRouter;
