import { model, Schema } from 'mongoose';
import { emailRegExp } from '../../constants/users.js';
import { handleSaveError } from './hooks.js';

export const genderList = ['woman', 'man'];

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      match: emailRegExp,
    },
    password: {
      type: String,
    },
    newPassword: {
      type: String,
    },
    gender: {
      type: String,
      default: 'woman',
      enum: genderList,
    },
    photo: {
      type: String,
    },
    waterRate: {
      type: Number,
      min: 1,
      max: 15000,
      default: 2000,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

userSchema.post('save', handleSaveError);

userSchema.methods.updatePassword = function (newPassword) {
  this.password = newPassword;
  this.newPassword = undefined; // Очищення поля newPassword після оновлення
};

export const User = model('user', userSchema);
