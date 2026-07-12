import { Router } from 'express';
import * as exportController from '../controllers/exportController';

const router = Router();

router.get('/csv', exportController.exportData);

export default router;
