import Joi from 'joi';
import { emailRegExp } from "../constants/users.js";
import { genderList } from '../db/models/User.js';

export const userLoginSchema = Joi.object({
    email: Joi.string().pattern(emailRegExp).required(),
    password: Joi.string().min(8).max(64).required(),
});

export const userUpdateSchema = Joi.object({
    name: Joi.string().min(3).max(20),
    email: Joi.string().pattern(emailRegExp),
    password: Joi.string().min(8).max(64),
    newPassword: Joi.string().min(8).max(64),
    gender: Joi.string().valid(...genderList),
});

export const userWaterRateSchema = Joi.object({
    waterRate: Joi.number().min(1).max(15000).required()
});