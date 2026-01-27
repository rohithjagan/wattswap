import express from 'express';
import { getForecast, getForecastSummary } from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/forecast', protect, getForecast);
router.get('/summary', protect, getForecastSummary);

export default router;
