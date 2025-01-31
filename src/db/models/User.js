import { model, Schema } from 'mongoose';
import { emailRegExp } from '../../constants/users.js';
import {handleSaveError} from './hooks.js';

export const genderList = ['woman', 'man'];

const userSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    match: emailRegExp
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
  },
{
    versionKey: false, timestamps: true,
  });

userSchema.post('save', handleSaveError);

userSchema.methods.updatePassword = function(newPassword) {
  this.password = newPassword;
  this.newPassword = undefined; // Очищення поля newPassword після оновлення
};

const UserCollection = model('user', userSchema);
export default UserCollection;