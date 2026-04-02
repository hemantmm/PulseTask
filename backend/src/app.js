import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function buildApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (origin === env.clientOrigin) return callback(null, true);
        if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    })
  );
  app.use(morgan('dev'));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/videos', videoRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
