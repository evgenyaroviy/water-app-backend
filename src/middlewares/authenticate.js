import { Session } from '../db/models/Session.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 401,
        message: 'UnauthorizedError',
        data: {
          message: 'No token provided',
        },
      });
    }

    const accessToken = authHeader.split(' ')[1];
    const session = await Session.findOne({
      accessToken,
      accessTokenValidUntil: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({
        status: 401,
        message: 'UnauthorizedError',
        data: {
          message: 'Session not found',
        },
      });
    }

    req.user = { id: session.userId };
    next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: 'UnauthorizedError',
      data: {
        message: error.message,
      },
    });
  }
};
