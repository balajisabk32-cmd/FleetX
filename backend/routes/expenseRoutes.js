import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';
import * as expenseController from '../controllers/expenseController.js';

const router = express.Router();

const validCategories = ['Maintenance', 'Toll', 'Parking', 'Insurance', 'Fine', 'Miscellaneous'];

const expenseValidationRules = [
    body('vehicle_id').notEmpty().withMessage('Vehicle ID is required').isString().withMessage('Invalid Vehicle ID'),
    body('category').isIn(validCategories).withMessage(`Category must be one of: ${validCategories.join(', ')}`),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive'),
    body('expense_date').notEmpty().withMessage('Expense Date is required').isISO8601().withMessage('Must be a valid date')
];

router.post('/', expenseValidationRules, validateRequest, expenseController.addExpenseLog);
router.get('/', expenseController.getExpenseLogs);
router.get('/:id', expenseController.getExpenseLogById);
router.put('/:id', expenseValidationRules, validateRequest, expenseController.updateExpenseLog);
router.delete('/:id', expenseController.deleteExpenseLog);

export default router;
