import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { MaintenanceController } from '../controllers/maintenanceController';

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
        body('issue').notEmpty().withMessage('Issue cannot be empty'),
        body('description').notEmpty().withMessage('Description cannot be empty'),
        body('maintenance_type').notEmpty().withMessage('Maintenance type is required'),
        body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid priority'),
        body('estimated_cost').isFloat({ min: 0 }).withMessage('Estimated cost must be 0 or positive'),
        body('mechanic_name').notEmpty().withMessage('Mechanic name is required')
    ], 
    validate, 
    MaintenanceController.createMaintenance
);

router.put('/:id', 
    [
        body('estimated_cost').optional().isFloat({ min: 0 }).withMessage('Estimated cost must be 0 or positive'),
        body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid priority')
    ],
    validate,
    MaintenanceController.updateMaintenance
);

router.put('/:id/close', 
    [
        body('actual_cost').isFloat({ min: 0 }).withMessage('Actual cost is required and must be 0 or positive'),
        body('completion_notes').notEmpty().withMessage('Completion notes are required')
    ],
    validate,
    MaintenanceController.closeMaintenance
);

router.get('/history', MaintenanceController.getMaintenanceHistory);
router.get('/reminders', MaintenanceController.getReminders);
router.get('/', MaintenanceController.getAllMaintenance);
router.get('/:id', MaintenanceController.getMaintenanceById);
router.delete('/:id', MaintenanceController.deleteMaintenance);

export default router;
