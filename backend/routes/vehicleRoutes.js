import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';
import * as vehicleController from '../controllers/vehicleController.js';

const router = express.Router();

const vehicleValidationRules = [
    body('id').notEmpty().withMessage('Vehicle ID is required').isString(),
    body('license_plate').optional().isString(),
    body('fuel_capacity').isFloat({ gt: 0 }).withMessage('Fuel capacity must be greater than 0'),
    body('acquisition_cost').optional().isFloat({ min: 0 }).withMessage('Acquisition cost cannot be negative')
];

router.post('/', vehicleValidationRules, validateRequest, vehicleController.addVehicle);
router.get('/', vehicleController.getVehicles);

export default router;
