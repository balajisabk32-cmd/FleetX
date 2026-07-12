import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import tripRoutes from './routes/tripRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files for testing
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
