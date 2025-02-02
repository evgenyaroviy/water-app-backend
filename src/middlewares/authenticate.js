import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { User } from '../db/models/User.js';

export const authenticate = async (req, res, next) => {
  const { authorization = '' } = req.headers;
  const [bearer, token] = authorization.split(' ');

  if (bearer !== 'Bearer') {
    next(createHttpError(401, 'Not authorized'));
    return;
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);

    if (!user || !user.token || user.token !== token) {
      next(createHttpError(401, 'Not authorized'));
      return;
    }

    req.user = user;
    next();
  } catch  {
    next(createHttpError(401, 'Not authorized'));
  }
};