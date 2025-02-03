import createHttpError from 'http-errors';

import { User } from '../db/models/User.js';

export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    return user;
  } catch (error) {
    if (error.name === 'CastError') {
      throw createHttpError(400, 'Invalid user ID format');
    }
    throw error;
  }
};

export const updateUser = async (filter, updateData) => {
  try {
    const user = await User.findOneAndUpdate(filter, updateData, {
      new: true,
    }).select('-password');

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    return user;
  } catch (error) {
    if (error.name === 'CastError') {
      throw createHttpError(400, 'Invalid user ID format');
    }
    throw error;
  }
};
