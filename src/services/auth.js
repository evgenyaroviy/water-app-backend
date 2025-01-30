import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import path from 'path';
import { readFile } from 'node:fs/promises';
import Handlebars from 'handlebars';


import UserCollection from '../db/models/User.js';
import SessionCollection from '../db/models/Session.js';
import { accessTokenLifetime, refreshTokenLifetime } from '../constants/users.js';

import { SMTP } from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendEmail.js';

import { TEMPLATE_DIR } from '../constants/index.js';

const emailTemplatePath = path.resolve(TEMPLATE_DIR, 'verify-email.html');

const emailTemplateSourse = await readFile(emailTemplatePath, 'utf-8');

const appDomain = getEnvVar('APP_DOMAIN');


const createSessionData = () => ({
    accessToken: randomBytes(30).toString('base64'),
    refreshToken: randomBytes(30).toString('base64'),
    accessTokenValidUntil:  new Date(Date.now() + accessTokenLifetime),
    refreshTokenValidUntil:  new Date(Date.now() + refreshTokenLifetime),
});

export const register = async payload => {
    const {email, password} = payload;
    const user = await UserCollection.findOne({email});
    if (user) {
        throw createHttpError(409, 'Email in use');
    }
    
    const hashPassword = await bcrypt.hash(password, 10);
    
    const newUser = await UserCollection.create({...payload, password: hashPassword});
    
    return newUser;
};

export const login = async ({email, password}) => {
    const user = await UserCollection.findOne({email});
    if (!user) {
        throw createHttpError(401, 'Invalid email or password');
    }

    const passwordCompear = await bcrypt.compare(password, user.password);
    if (!passwordCompear) {
        throw createHttpError(401, 'Invalid email or password');
    }

    await SessionCollection.deleteOne({userId: user._id});

    const sessionData = createSessionData();

    return SessionCollection.create({
        userId: user._id,
        ...sessionData,
});
};

export const refreshToken = async (payload) => {
    const oldSession = await SessionCollection.findOne({
        _id: payload.sessionId, 
        refreshToken: payload.refreshToken
    });
    if (!oldSession) {
        throw createHttpError(401, 'Session not found');
    }
    if(Date.now() > oldSession.refreshTokenValidUntil) {
        throw createHttpError(401, 'Refresh token expired');
    }

    await SessionCollection.deleteOne({id: payload.sessionId});

    const sessionData = createSessionData();

    return SessionCollection.create({
        userId: oldSession.userId,
        ...sessionData,
    });
};

export const logout = async sessionId => {
    await SessionCollection.deleteOne({id: sessionId});
};

export const getUser = filter => UserCollection.findOne(filter);

export const getSession = filter => SessionCollection.findOne(filter);

export const requestResetToken = async (email) => {
    const user = await UserCollection.findOne({ email });
    if (!user) {
        throw createHttpError(404, 'User not found');
    }
    const resetToken = jwt.sign({ email }, getEnvVar('JWT_SECRET'), { expiresIn: '5m',});
    
    const emailTemplate = Handlebars.compile(emailTemplateSourse);
    
    const html = emailTemplate({
        link: `${appDomain}/reset-password?token=${resetToken}`,
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

  const user = await UserCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    console.log('User not found:', entries.email, entries.sub);
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UserCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};