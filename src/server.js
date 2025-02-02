import express from 'express';
// import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getEnvVar } from './utils/getEnvVar.js';
import helmet from 'helmet';

// import authRouter from './routers/auth.js';
// import userRouter from './routers/user.js';
import waterRouter from './routers/water.js';

import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = Number(getEnvVar('PORT', 3000));

export const setupServer = () => {
  const app = express();

  // Настройка helmet для безопасности
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https:'],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: true,
      dnsPrefetchControl: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    }),
  );

  const corsMiddleware = cors();
  app.use(express.json());
  app.use(express.static('uploads'));
  app.use(cookieParser());
  // const logger = pino({
  //   transport: {
  //     target: 'pino-pretty',
  //   },
  // });

  app.use(corsMiddleware);
  // app.use(logger);

  // app.use('/auth', authRouter);
  // app.use("/users", userRouter);
  // app.use("/water-rate", waterRate);
  // app.use("/water", water);
  // app.use("/today", todayWater);
  // app.use("/month", monthWater);
  app.use('/api/water', waterRouter);
  app.use('/api-docs', swaggerDocs());

  app.use('*', notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};