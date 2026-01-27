import { Request, Response } from 'express';
import Order from '../models/Order';
import Trade from '../models/Trade';
import { getIO } from '../index';
import { matchOrders } from '../services/matchingEngine';

import User from '../models/User';

// @desc    Create a new buy/sell order
// @route   POST /api/trades/order
// @access  Private (requires auth)
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, quantity, pricePerUnit } = req.body;
        const userId = (req as any).user._id; // From auth middleware

        // Validation
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (type === 'SELL' && user.surplusEnergy < quantity) {
            res.status(400).json({ message: `Insufficient surplus energy. You have ${user.surplusEnergy.toFixed(2)} kWh available.` });
            return;
        }

        if (type === 'BUY' && user.walletBalance < quantity * pricePerUnit) {
            res.status(400).json({ message: `Insufficient wallet balance. Total cost: ₹${(quantity * pricePerUnit).toFixed(2)}` });
            return;
        }

        if (!['BUY', 'SELL'].includes(type)) {
            res.status(400).json({ message: 'Invalid order type. Must be BUY or SELL.' });
            return;
        }

        if (quantity <= 0 || pricePerUnit <= 0) {
            res.status(400).json({ message: 'Quantity and price must be positive.' });
            return;
        }

        // Create the order
        const order = await Order.create({
            userId,
            type,
            quantity,
            pricePerUnit,
            status: 'PENDING',
            filledQuantity: 0,
        });

        // Attempt to match with existing orders
        const io = getIO();
        const updatedOrder = await matchOrders(io, order);

        res.status(201).json({
            message: 'Order created successfully',
            order: updatedOrder,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's orders
// @route   GET /api/trades/orders
// @access  Private
export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trade history for user
// @route   GET /api/trades/history
// @access  Private
export const getTradeHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const trades = await Trade.find({
            $or: [{ buyerId: userId }, { sellerId: userId }]
        })
            .sort({ timestamp: -1 })
            .populate('buyerId', 'name email')
            .populate('sellerId', 'name email');

        res.json(trades);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel a pending order
// @route   DELETE /api/trades/order/:id
// @access  Private
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user._id.toString();

        const order = await Order.findById(id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (order.userId.toString() !== userId) {
            res.status(403).json({ message: 'Not authorized to cancel this order' });
            return;
        }

        if (order.status === 'COMPLETED') {
            res.status(400).json({ message: 'Cannot cancel a completed order' });
            return;
        }

        if (order.status === 'CANCELLED') {
            res.status(400).json({ message: 'Order already cancelled' });
            return;
        }

        order.status = 'CANCELLED';
        await order.save();

        res.json({ message: 'Order cancelled successfully', order });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
