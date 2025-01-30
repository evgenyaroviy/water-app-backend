import express from 'express';
// import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getEnvVar } from './utils/getEnvVar.js';

import {
  authRouter,
  userRouter,
  waterRateRouter,
  waterRouter,
  todayWaterRouter,
  monthWaterRouter,
} from "./routers/index.js  ";

import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = Number(getEnvVar('PORT', 3000));

export const setupServer = () => {
  const app = express();

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

  app.use('/auth', authRouter);
  app.use("/users", userRouter);
  app.use("/water-rate", waterRateRouter);
  app.use("/water", waterRouter);
  app.use("/today", todayWaterRouter);
  app.use("/month", monthWaterRouter);
  app.use('/api-docs', swaggerDocs());


  app.use('*', notFoundHandler);
  
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};