import { Router } from 'express';
import { 
  createDriver, 
  getDrivers, 
  getDriverById, 
  updateDriver, 
  deleteDriver 
} from '../controllers/driverController';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateMiddleware';
import { driverSchema, driverUpdateSchema } from '../validators/schemas';

const router = Router();

// Only Admin and Manager can modify drivers
router.post('/', authenticateToken, requireRole(['Admin', 'Manager']), validateRequest(driverSchema), createDriver);
router.put('/:id', authenticateToken, requireRole(['Admin', 'Manager']), validateRequest(driverUpdateSchema), updateDriver);
router.delete('/:id', authenticateToken, requireRole(['Admin', 'Manager']), deleteDriver);

// Anyone authenticated can view drivers
router.get('/', authenticateToken, getDrivers);
router.get('/:id', authenticateToken, getDriverById);

export default router;
