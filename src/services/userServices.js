import createHttpError from 'http-errors';

import SessionCollection from '../db/models/Session.js';
import { User } from '../db/models/User.js';

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const session = await SessionCollection.findOne({ owner: userId });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }
  return {
    user,
    accessToken: session.accessToken,
  };
};

export const updateUser = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  return user;
};
