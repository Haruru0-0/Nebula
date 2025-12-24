import express from 'express';
import * as metricsController from '../controllers/metricsController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.get('/overall', metricsController.getOverallMetrics);
router.get('/:agentId', metricsController.getMetrics);

export default router;