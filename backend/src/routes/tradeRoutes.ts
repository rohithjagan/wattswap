import express from 'express';
import { createOrder, getUserOrders, getTradeHistory, cancelOrder } from '../controllers/tradeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/order', protect, createOrder);
router.get('/orders', protect, getUserOrders);
router.get('/history', protect, getTradeHistory);
router.delete('/order/:id', protect, cancelOrder);

export default router;
