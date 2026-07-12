import { Router } from 'express';
import { validateRequest } from '../middlewares/validateMiddleware';
import { fuelSchema } from '../validators/schemas';
import * as fuelController from '../controllers/fuelController';

const router = Router();

router.post('/', validateRequest(fuelSchema), fuelController.addFuelLog);
router.get('/', fuelController.getFuelLogs);
router.get('/:id', fuelController.getFuelLogById);
router.put('/:id', validateRequest(fuelSchema.partial()), fuelController.updateFuelLog);
router.delete('/:id', fuelController.deleteFuelLog);

export default router;
