import { model, Schema } from 'mongoose';
import { handleSaveError } from '../../middlewares/errorHandler.js';
import { WATER_CONSTANTS } from '../../constants/water.js';

const waterEntrySchema = new Schema({
  amountWater: {
    type: Number,
    required: true,
    min: WATER_CONSTANTS.MIN_WATER_AMOUNT,
    max: WATER_CONSTANTS.MAX_WATER_AMOUNT,
  },
  time: {
    type: String,
    required: true,
  },
});

const waterSchema = new Schema(
  {
    entries: [waterEntrySchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    dailyNorm: {
      type: Number,
      default: WATER_CONSTANTS.DEFAULT_DAILY_NORM,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
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
