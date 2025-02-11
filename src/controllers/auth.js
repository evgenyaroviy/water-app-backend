import { registerUser } from '../services/auth.js';
import { loginUser } from '../services/auth.js';
import { logoutUser } from '../services/auth.js';
import { refreshUserSession } from '../services/auth.js';
import { requestResetToken } from '../services/auth.js';
import { resetPassword } from '../services/auth.js';

import { refreshTokenLifetime } from '../constants/users.js';

import { setupSession } from '../utils/setupSession.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  const loginPayload = {
    email: req.body.email,
    password: req.body.password,
  };

  const session = await loginUser(loginPayload);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      user: user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    },
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + refreshTokenLifetime),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + refreshTokenLifetime),
  });

  res.json({
    status: 200,
    message: 'Successfully logged in an user',
    data: {
      accessToken: session.accessToken,
      userId: session.userId,
    },
  });
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUserSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const requestResetTokenController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.json({
    message: 'Reset password email was successfully sent',
    status: 200,
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password was successfully reset',
    status: 200,
    data: {},
  });
};
