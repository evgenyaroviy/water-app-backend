import Joi from "joi";

export const waterInputSchema = Joi.object({
    value: Joi.number().required().messages({
      'any.required': 'Enter the value of the water used',
      'number.base': 'Value must be a number',
    }),
    date: Joi.date().default(() => new Date(), 'current date'),
  });