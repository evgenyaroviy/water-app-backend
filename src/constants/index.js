import path from 'path';
import { WATER_CONSTANTS, TIME_FORMATS, MONTH_NAMES } from './water.js';
import { emailRegExp, accessTokenLifetime, refreshTokenLifetime } from './users.js';

export const TEMPLATE_DIR = path.resolve('src', 'templates');

export const TEMP_UPLOAD_DIR = path.resolve('temp');

export const UPLOAD_DIR = path.resolve('upload');



export const SMTP = {
  SMTP_HOST: 'SMTP_HOST',
  SMTP_PORT: 'SMTP_PORT',
  SMTP_USER: 'SMTP_USER',
  SMTP_PASSWORD: 'SMTP_PASSWORD',
  SMTP_FROM: 'SMTP_FROM',
};

export const SWAGGER_PATH = path.resolve('docs', 'swagger.json');

export {
  WATER_CONSTANTS,
  TIME_FORMATS,
  MONTH_NAMES,
  emailRegExp,
  accessTokenLifetime,
  refreshTokenLifetime,
};