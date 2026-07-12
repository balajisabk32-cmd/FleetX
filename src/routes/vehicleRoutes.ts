import { Router } from 'express';
import { 
  createVehicle, 
  getVehicles, 
  getVehicleById, 
  updateVehicle, 
  deleteVehicle 
} from '../controllers/vehicleController';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateMiddleware';
import { vehicleSchema, vehicleUpdateSchema } from '../validators/schemas';

const router = Router();

// Only Admin and Manager can modify vehicles
router.post('/', authenticateToken, requireRole(['Admin', 'Manager']), validateRequest(vehicleSchema), createVehicle);
router.put('/:id', authenticateToken, requireRole(['Admin', 'Manager']), validateRequest(vehicleUpdateSchema), updateVehicle);
router.delete('/:id', authenticateToken, requireRole(['Admin', 'Manager']), deleteVehicle);

// Anyone authenticated can view vehicles
router.get('/', authenticateToken, getVehicles);
router.get('/:id', authenticateToken, getVehicleById);

export default router;
