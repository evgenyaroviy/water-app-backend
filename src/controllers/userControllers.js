import createHttpError from 'http-errors';

import { getUserById, updateUser } from '../services/userServices.js';

import { saveFileToCloud } from '../utils/saveFileToCloud.js';
import { saveFileToUploadsDir } from '../utils/saveFileToUploadsDir.js';

import { env } from '../../.env.js';

export const getUserByIdController = async (req, res, next) => {
  const { userId } = req.params;
  const user = await getUserById(userId);

  if (!user) {
    next(new Error('User not found'));
    return;
  }

  res.json({
    status: 200,
    message: `Successfully found user with id ${userId}`,
    data: user,
  });
};

export const updateUserController = async (req, res, next) => {
  const { userId } = req.params;
  const updateData = req.body;
  const photo = req.file;

  let photoUrl;

  if (photo) {
    if (env('CLOUDINARY_ENABLE')) {
      photoUrl = await saveFileToCloud(photo);
    } else {
      photoUrl = saveFileToUploadsDir(photo);
    }
  }

  const user = await updateUser(
    { _id: userId },
    {
      ...updateData,
      photo: photoUrl,
    },
  );
  if (!user) {
    return next(createHttpError(404, 'User not found'));
  }

  res.json({
    status: 200,
    message: `Successfully updated user with id ${userId}`,
    data: user,
  });
};
