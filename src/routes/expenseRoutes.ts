import { Router } from 'express';
import { validateRequest } from '../middlewares/validateMiddleware';
import { expenseSchema } from '../validators/schemas';
import * as expenseController from '../controllers/expenseController';

const router = Router();

router.post('/', validateRequest(expenseSchema), expenseController.addExpenseLog);
router.get('/', expenseController.getExpenseLogs);
router.get('/:id', expenseController.getExpenseLogById);
router.put('/:id', validateRequest(expenseSchema.partial()), expenseController.updateExpenseLog);
router.delete('/:id', expenseController.deleteExpenseLog);

export default router;
