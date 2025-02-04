import Joi from 'joi';
import { WATER_CONSTANTS } from '../constants/water.js';

const waterEntryValidation = {
  waterVolume: Joi.number()
    .min(WATER_CONSTANTS.MIN_WATER_AMOUNT)
    .max(WATER_CONSTANTS.MAX_WATER_AMOUNT)
    .required()
    .messages({
      'number.base': 'Water amount must be a number',
      'number.min': 'Minimum water amount is 1 ml',
      'number.max': 'Maximum water amount is 5000 ml',
      'any.required': 'Water amount is required',
    }),

  time: Joi.string()
    .pattern(new RegExp(`^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$`))
    .required()
    .messages({
      'string.pattern.base': 'Time must be in the format HH:mm',
      'any.required': 'Time is required',
    }),

  date: Joi.date().iso().required().messages({
    'date.base': 'Date must be a valid date',
    'any.required': 'Date is required',
  }),
};

const baseWaterSchema = Joi.object(waterEntryValidation);

const entriesWaterSchemas = baseWaterSchema.clone();
const updateWaterSchemas = baseWaterSchema.clone();

const updateDailyNormSchema = Joi.object({
  waterRate: Joi.number()
    .min(WATER_CONSTANTS.MIN_DAILY_NORM)
    .max(WATER_CONSTANTS.MAX_DAILY_NORM)
    .required()
    .messages({
      'number.base': 'Daily norm must be a number',
      'number.min': `Daily norm must be at least ${WATER_CONSTANTS.MIN_DAILY_NORM} ml`,
      'number.max': `Daily norm cannot exceed ${WATER_CONSTANTS.MAX_DAILY_NORM} ml`,
      'any.required': 'Daily norm is required',
    }),
});

export const schemas = {
  entriesWaterSchemas,
  updateWaterSchemas,
  updateDailyNormSchema,
};
