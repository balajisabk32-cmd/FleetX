import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler.js';

// Routes
import fuelRoutes from './routes/fuelRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        data: null
    });
});

// Routes
app.use('/api/fuel', fuelRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/export', exportRoutes);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        data: null
    });
});

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
