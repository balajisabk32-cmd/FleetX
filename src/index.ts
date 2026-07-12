import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import driverRoutes from './routes/driverRoutes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Performance Middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true })); // allow credentials for cookies
app.use(cookieParser());
app.use(express.json());

// Rate limiting for login route specifically disabled for testing
const loginLimiter = (req: any, res: any, next: any) => next();

// Routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);

// Simple Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fleet Management Backend is running' });
});

// Serve the Visual Tester HTML file at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
