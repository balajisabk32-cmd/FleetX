import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';

const router = Router();

router.get('/health-score', analyticsController.getHealthScore);
router.get('/expense-forecast', analyticsController.getExpenseForecast);
router.get('/fuel-theft', analyticsController.getFuelTheft);
router.get('/rankings', analyticsController.getRankings);
router.get('/maintenance-suggestions', analyticsController.getMaintenanceSuggestions);
router.get('/dashboard', analyticsController.getDashboard);

export default router;
