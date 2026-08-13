import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { DataSource } from 'typeorm';

import { env } from './config/env';
import { buildContainer } from './container';
import { buildAuthRoutes } from './routes/authRoutes';
import { buildProjectRoutes, buildTaskRoutes, buildNotificationRoutes } from './routes/projectRoutes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

/**
 * Builds and returns a fully configured Express application without
 * starting an HTTP listener. Separating "build the app" from "listen on a
 * port" is what lets the integration test suite (tests/integration) spin
 * up the exact same app in-process against Supertest, with no network
 * sockets and no separate server process required.
 */
export function createApp(dataSource: DataSource): Application {
  const app = express();
  const container = buildContainer(dataSource);

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  if (!env.isTest) {
    app.use(morgan('dev'));
  }

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', buildAuthRoutes(container));
  app.use('/api/projects', buildProjectRoutes(container));
  app.use('/api/tasks', buildTaskRoutes(container));
  app.use('/api/notifications', buildNotificationRoutes(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
