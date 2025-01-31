import Joi from "joi";
import { emailRegExp } from "../constants/users.js";

export const authRegisterSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().pattern(emailRegExp).required(),
    password: Joi.string().min(6).required(),
});

export const authLoginSchema = Joi.object({
    email: Joi.string().pattern(emailRegExp).required(),
    password: Joi.string().min(6).required(),
});

export const requestResetEmailSchema = Joi.object({
    email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});