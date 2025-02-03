import { model, Schema } from 'mongoose';
import { handleSaveError } from '../../middlewares/errorHandler.js';
import { WATER_CONSTANTS } from '../../constants/water.js';

const waterSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    waterVolume: {
      type: Number,
      required: true,
      min: WATER_CONSTANTS.MIN_WATER_AMOUNT,
      max: WATER_CONSTANTS.MAX_WATER_AMOUNT,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    time: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    dailyNorm: {
      type: Number,
      default: WATER_CONSTANTS.DEFAULT_DAILY_NORM,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

waterSchema.post('save', handleSaveError);
waterSchema.pre('findOneAndUpdate', handleSaveError);
waterSchema.post('findOneAndUpdate', handleSaveError);

export const Water = model('water', waterSchema);
