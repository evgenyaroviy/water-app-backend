import { model, Schema } from 'mongoose';
import { emailRegExp } from '../../constants/users.js';
import {handleSaveError} from './hooks.js';

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: emailRegExp
  },
  password: {
    type: String,
    required: true
  },
  // verify: {
  //   type: Boolean,
  //   default: false,
  //   required: true,
  // },
  
},
{
    versionKey: false, timestamps: true,
  });

userSchema.post('save', handleSaveError);

const UserCollection = model('user', userSchema);
export default UserCollection;
