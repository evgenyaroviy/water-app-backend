import { model, Schema } from 'mongoose';
import {handleSaveError} from './hooks.js';


const waterInputSchema = new Schema(
  {
    waterVolume: {
      type: Number,
      min: 1,
      max: 5000,
      required: [true, "Enter the value of the water used"],
    },
    date: {
      type: Date,
      default: Date.now,
      required: [true, "Enter the time of entering"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

waterInputSchema.post('save', handleSaveError);

waterInputSchema.pre('findOneAndUpdate', handleSaveError);

waterInputSchema.post('findOneAndUpdate', handleSaveError);

export const WaterInput  = model('waterInput', waterInputSchema);