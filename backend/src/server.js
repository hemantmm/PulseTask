import { createServer } from 'node:http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { connectDb, isDbAvailable } from './config/db.js';
import { env } from './config/env.js';
import { buildApp } from './app.js';
import { ensureDemoUsers } from './services/bootstrapSeed.js';
import { setIo } from './services/socketService.js';

async function bootstrap() {
  await connectDb();
  if (isDbAvailable()) {
    await ensureDemoUsers();
  }

  const app = buildApp();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigin,
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));
      const payload = jwt.verify(token, env.jwtSecret);
      socket.data.user = {
        id: payload.sub,
        tenantId: payload.tenantId,
        role: payload.role
      };
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    socket.join(`tenant:${user.tenantId}`);
    socket.join(`user:${user.id}`);
  });

  setIo(io);

  httpServer.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error);
  process.exit(1);
});
