import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import authRoutes from './routes/authRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import driverRoutes from './routes/driverRoutes';
import notificationRoutes from './routes/notificationRoutes';
import documentRoutes from './routes/documentRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { initCronJobs } from './services/cronService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Background Workers
initCronJobs();

// Security and Performance Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Rate limiting for login route specifically disabled for testing
const loginLimiter = (req: any, res: any, next: any) => next();

// Routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);

// Simple Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fleet Management Backend is running' });
});

// Serve the Visual Tester HTML file at the root
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
