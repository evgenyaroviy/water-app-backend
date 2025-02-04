import { model, Schema } from 'mongoose';
import { emailRegExp } from '../../constants/users.js';
import { handleSaveError } from './hooks.js';
import bcrypt from 'bcrypt';

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
      required: [true, 'Пароль обязателен'],
      minlength: [6, 'Минимальная длина пароля 6 символов'],
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

userSchema.methods.comparePassword = async function (candidatePassword) {
  console.log('Comparing passwords:');
  console.log('Candidate password:', candidatePassword);
  console.log('Stored hash:', this.password);
  try {
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('Compare result:', result);
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Хеширование пароля перед сохранением
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const User = model('user', userSchema);
