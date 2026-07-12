import express from 'express';
import * as exportController from '../controllers/exportController.js';

const router = express.Router();

router.get('/csv', exportController.exportData);

export default router;
