import { model, Schema } from 'mongoose';
import { emailRegExp } from '../../constants/users.js';
import { handleSaveError } from './hooks.js';
import bcrypt from 'bcrypt';
import { WATER_CONSTANTS } from '../../constants/water.js';

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
      required: [true, 'Password is required'],
      minlength: [6, 'Minimum password length is 6 characters'],
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
      min: WATER_CONSTANTS.MIN_DAILY_NORM,
      max: WATER_CONSTANTS.MAX_DAILY_NORM,
      default: WATER_CONSTANTS.DEFAULT_DAILY_NORM,
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
  this.newPassword = undefined;
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

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update.waterRate || (update.$set && update.$set.waterRate)) {
    const waterRate = update.waterRate || update.$set.waterRate;

    if (
      waterRate < WATER_CONSTANTS.MIN_DAILY_NORM ||
      waterRate > WATER_CONSTANTS.MAX_DAILY_NORM
    ) {
      const error = new Error(
        `Water rate must be between ${WATER_CONSTANTS.MIN_DAILY_NORM} and ${WATER_CONSTANTS.MAX_DAILY_NORM} milliliters`,
      );
      error.status = 400;
      throw error;
    }
  }

  next();
});

userSchema.post('findOneAndUpdate', (error, res, next) => {
  if (error.status === 400) {
    next(error);
  } else {
    handleSaveError(error, next);
  }
});

export const User = model('user', userSchema);
