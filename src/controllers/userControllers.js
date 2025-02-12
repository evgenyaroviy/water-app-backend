import bcrypt from 'bcrypt';
import { User } from '../db/models/User.js';
import { Session } from '../db/models/Session.js';

import { getUserById, updateUser } from '../services/userServices.js';

import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/tokenUtils.js';
import { saveFileToCloud } from '../utils/saveFileToCloud.js';
import { saveFileToUploadsDir } from '../utils/saveFileToUploadsDir.js';
import { getEnvVar } from '../utils/getEnvVar.js';

export const getUserByIdController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);

    res.json({
      status: 200,
      message: `Successfully found user with id ${userId}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword, name, ...updateData } = req.body;
    const photo = req.file;

    let photoUrl;

    if (photo) {
      if (getEnvVar('CLOUDINARY_ENABLE')) {
        photoUrl = await saveFileToCloud(photo);
      } else {
        photoUrl = saveFileToUploadsDir(photo);
      }
      updateData.photo = photoUrl;
    }

    if (oldPassword && newPassword) {
      const user = await User.findById(userId);
      if (!user || !(await user.comparePassword(oldPassword))) {
        return res.status(401).json({
          status: 401,
          message: 'Invalid current password',
        });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (name) {
      updateData.name = name;
    }

    const user = await updateUser({ _id: userId }, updateData);

    res.json({
      status: 200,
      message: `Successfully updated user with id ${userId}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid credentials',
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const sessionData = {
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    const session = new Session(sessionData);
    await session.save();

    return res.status(200).json({
      status: 200,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Something went wrong',
      data: error.message,
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 400,
        message: 'Refresh token is required',
      });
    }

    const session = await Session.findOne({ refreshToken });

    if (!session) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid refresh token',
      });
    }

    if (new Date() > session.refreshTokenValidUntil) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({
        status: 401,
        message: 'Refresh token has expired',
      });
    }

    const newAccessToken = generateAccessToken(session.userId);
    const newRefreshToken = generateRefreshToken(session.userId);

    session.accessToken = newAccessToken;
    session.refreshToken = newRefreshToken;
    session.accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 минут
    session.refreshTokenValidUntil = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    await session.save();

    return res.status(200).json({
      status: 200,
      message: 'Tokens refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Something went wrong',
      data: error.message,
    });
  }
};
