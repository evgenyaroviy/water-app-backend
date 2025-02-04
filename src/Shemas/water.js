import Joi from 'joi';
import { WATER_CONSTANTS } from '../constants/water.js';

const waterEntryValidation = {
  waterVolume: Joi.number()
    .min(WATER_CONSTANTS.MIN_WATER_AMOUNT)
    .max(WATER_CONSTANTS.MAX_WATER_AMOUNT)
    .required()
    .messages({
      'number.base': 'Количество воды должно быть числом',
      'number.min': 'Минимальное количество воды 1 мл',
      'number.max': 'Максимальное количество воды 5000 мл',
      'any.required': 'Количество воды обязательно',
    }),
  time: Joi.string()
    .pattern(new RegExp(`^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$`))
    .required()
    .messages({
      'string.pattern.base': 'Время должно быть в формате HH:mm',
      'any.required': 'Время обязательно',
    }),
  date: Joi.date().iso().required().messages({
    'date.base': 'Дата должна быть валидной',
    'any.required': 'Дата обязательна',
  }),
};

const baseWaterSchema = Joi.object(waterEntryValidation);

const entriesWaterSchemas = baseWaterSchema.clone();
const updateWaterSchemas = baseWaterSchema.clone();

const updateDailyNormSchema = Joi.object({
  dailyNormMilliliters: Joi.number().min(1).max(15000).required().messages({
    'number.base': 'Дневная норма должна быть числом',
    'number.min': 'Дневная норма должна быть больше 0',
    'number.max': 'Дневная норма не может превышать 15000 мл',
    'any.required': 'Дневная норма обязательна',
  }),
});

export const schemas = {
  entriesWaterSchemas,
  updateWaterSchemas,
  updateDailyNormSchema,
};
