import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';           // ADD THIS
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/error.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import classRoutes from './routes/classRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import lectureRoutes from './routes/lectureRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { initSocket } from "./socket/index.js";

dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];
const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variable(s): ${missing.join(', ')}`);
  process.exit(1);
}

connectDB();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = initSocket(server);
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://192.168.0.110:5173"
];

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', db: dbState, time: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/upload', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const httpServer = server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

  // ADD THIS BLOCK — self-ping to prevent Render free-tier sleep
  if (process.env.NODE_ENV === 'production' && process.env.SERVER_URL) {
    cron.schedule('*/10 * * * *', async () => {
      try {
        const res = await fetch(`${process.env.SERVER_URL}/api/health`);
        console.log('Self-ping:', res.status, new Date().toISOString());
      } catch (err) {
        console.error('Self-ping failed:', err.message);
      }
    });
  }
});

// Render (and most hosts) send SIGTERM before killing the container on every
// redeploy/scale event. Without handling it, in-flight requests get dropped.
const shutdown = (signal) => {
  console.log(`${signal} received: closing server gracefully...`);
  httpServer.close(async () => {
    try {
      await mongoose.connection.close(false);
    } catch (err) {
      console.error('Error closing MongoDB connection:', err.message);
    }
    console.log('HTTP server and MongoDB connection closed.');
    process.exit(0);
  });
  // Force-exit if something hangs longer than 10s
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Last-resort safety nets: log clearly instead of an opaque crash/hang
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});