import { model, Schema } from 'mongoose';
import { emailRegExp } from '../../constants/users.js';
import { handleSaveError } from './hooks.js';
import bcrypt from 'bcryptjs';

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

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Хеширование пароля перед сохранением
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const User = model('user', userSchema);
