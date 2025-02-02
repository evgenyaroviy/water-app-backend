import Joi from 'joi';
import { WATER_CONSTANTS } from '../constants/water.js';

const waterEntryValidation = {
  amountWater: Joi.number()
    .min(WATER_CONSTANTS.MIN_WATER_AMOUNT)
    .max(WATER_CONSTANTS.MAX_WATER_AMOUNT)
    .required(),
  time: Joi.string()
    .pattern(new RegExp(`^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$`))
    .required(),
};

const baseWaterSchema = Joi.object(waterEntryValidation);

const entriesWaterSchemas = baseWaterSchema.clone();
const updateWaterSchemas = baseWaterSchema.clone();

export const schemas = {
  entriesWaterSchemas,
  updateWaterSchemas,
};

