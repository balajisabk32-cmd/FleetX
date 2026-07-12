import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { TripController } from '../controllers/tripController';

const router = Router();

const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
};

router.post('/', 
    [
        body('vehicle_id').isInt().withMessage('Vehicle ID is required and must be an integer'),
        body('driver_id').isInt().withMessage('Driver ID is required and must be an integer'),
        body('source').notEmpty().withMessage('Source is required'),
        body('destination').notEmpty().withMessage('Destination is required'),
        body('cargo_weight').isFloat({ gt: 0 }).withMessage('Cargo weight must be positive'),
        body('planned_distance').isFloat({ gt: 0 }).withMessage('Planned distance must be positive')
    ], 
    validate, 
    TripController.createTrip
);

router.get('/history', TripController.getTripHistory);
router.get('/', TripController.getAllTrips);
router.get('/:id', TripController.getTripById);
router.put('/:id', TripController.updateTrip);
router.delete('/:id', TripController.deleteTrip);
router.put('/:id/dispatch', TripController.dispatchTrip);
router.put('/:id/complete', TripController.completeTrip);
router.put('/:id/cancel', TripController.cancelTrip);

export default router;
