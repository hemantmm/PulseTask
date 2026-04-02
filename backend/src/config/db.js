import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env.js';

let memoryServer = null;
let dbAvailable = false;

export function isDbAvailable() {
  return dbAvailable;
}

export async function connectDb() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 3000 });
    dbAvailable = true;
  } catch {
    // Development fallback so the app remains usable without a local Mongo daemon.
    try {
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri('pulsetask');
      await mongoose.connect(memoryUri, { serverSelectionTimeoutMS: 3000 });
      dbAvailable = true;
    } catch {
      dbAvailable = false;
      // eslint-disable-next-line no-console
      console.warn('Running without database. Only demo login is available.');
    }
  }
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
