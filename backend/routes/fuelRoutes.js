import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';
import * as fuelController from '../controllers/fuelController.js';

const router = express.Router();

const fuelValidationRules = [
    body('vehicle_id').notEmpty().withMessage('Vehicle ID is required').isString().withMessage('Invalid Vehicle ID'),
    body('fuel_date').notEmpty().withMessage('Fuel Date is required').isISO8601().withMessage('Must be a valid date'),
    body('quantity').isFloat({ gt: 0 }).withMessage('Fuel quantity must be positive'),
    body('price_per_liter').isFloat({ gt: 0 }).withMessage('Price must be positive'),
    body('odometer').isFloat({ min: 0 }).withMessage('Odometer reading cannot be negative')
];

router.post('/', fuelValidationRules, validateRequest, fuelController.addFuelLog);
router.get('/', fuelController.getFuelLogs);
router.get('/:id', fuelController.getFuelLogById);
router.put('/:id', fuelValidationRules, validateRequest, fuelController.updateFuelLog);
router.delete('/:id', fuelController.deleteFuelLog);

export default router;
