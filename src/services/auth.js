import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

import { SMTP, TEMPLATE_DIR } from '../constants/index.js';

import { User } from '../db/models/User.js';
import { Session } from '../db/models/Session.js';

import { createSession } from '../utils/createSession.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getEnvVar } from '../utils/getEnvVar.js';

export const registerUser = async (payload) => {
  const user = await User.findOne({
    email: payload.email,
  });
  if (user) throw createHttpError(409, 'Email in use');

  console.log('Registering new user:', {
    email: payload.email,
    password: payload.password,
  });

  const newUser = await User.create({
    ...payload,
    password: payload.password,
  });

  console.log('Created user with hash:', {
    email: newUser.email,
    passwordHash: newUser.password.substring(0, 10) + '...',
  });

  return newUser;
};

export const loginUser = async (payload) => {
  const user = await User.findOne({
    email: payload.email,
  });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  console.log('Found user:', {
    email: user.email,
    passwordHash: user.password.substring(0, 10) + '...',
  });

  console.log('Attempting to compare passwords...');
  const isEqual = await user.comparePassword(payload.password);
  console.log('Password comparison details:', {
    result: isEqual,
    providedPasswordLength: payload.password.length,
    storedHashLength: user.password.length,
  });

  if (!isEqual) {
    throw createHttpError(401, 'Неверный email или пароль');
  }

  try {
    await Session.deleteOne({ userId: user._id });
  } catch (error) {
    console.error('Error deleting old session:', error);
  }

  const newSession = createSession();
  console.log('Created session object:', newSession);

  try {
    const session = await Session.create({
      userId: user._id,
      accessToken: newSession.accessToken,
      refreshToken: newSession.refreshToken,
      accessTokenValidUntil: newSession.accessTokenValidUntil,
      refreshTokenValidUntil: newSession.refreshTokenValidUntil,
    });

    console.log('Created new session:', {
      sessionId: session._id,
      userId: session.userId,
      hasAccessToken: !!session.accessToken,
      hasRefreshToken: !!session.refreshToken,
      accessTokenValidUntil: session.accessTokenValidUntil,
      refreshTokenValidUntil: session.refreshTokenValidUntil,
    });

    return session;
  } catch (error) {
    console.error('Error creating new session:', error);
    console.error('Session data attempted to create:', {
      userId: user._id,
      accessToken: newSession.accessToken,
      refreshToken: newSession.refreshToken,
      accessTokenValidUntil: newSession.accessTokenValidUntil,
      refreshTokenValidUntil: newSession.refreshTokenValidUntil,
    });
    throw createHttpError(500, 'Ошибка при создании сессии');
  }
};

export const logoutUser = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date(session.refreshTokenValidUntil) < new Date();

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();

  await Session.deleteOne({ _id: sessionId, refreshToken });

  return await Session.create({
    userId: session.userId,
    accessToken: newSession.accessToken,
    refreshToken: newSession.refreshToken,
    accessTokenValidUntil: newSession.accessTokenValidUntil,
    refreshTokenValidUntil: newSession.refreshTokenValidUntil,
  });
};

export const requestResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATE_DIR,
    'verify-email.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  const user = await User.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await User.updateOne({ _id: user._id }, { password: encryptedPassword });
};
