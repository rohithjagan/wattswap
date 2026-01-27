import { Server } from 'socket.io';
import Order from '../models/Order';
import Trade from '../models/Trade';
import User from '../models/User';

export const matchOrders = async (io: Server, newOrder: any) => {
    try {
        const { userId, type, quantity, pricePerUnit } = newOrder;

        // Find matching counter-orders
        const counterType = type === 'BUY' ? 'SELL' : 'BUY';

        // For BUY orders: match with SELL orders at pricePerUnit <= buy price (sorted lowest first)
        // For SELL orders: match with BUY orders at pricePerUnit >= sell price (sorted highest first)
        const query = {
            type: counterType,
            status: { $in: ['PENDING', 'PARTIAL'] },
            ...(type === 'BUY'
                ? { pricePerUnit: { $lte: pricePerUnit } }
                : { pricePerUnit: { $gte: pricePerUnit } }
            )
        };

        const sortOrder: any = type === 'BUY'
            ? { pricePerUnit: 1, createdAt: 1 }  // SELL orders: lowest price first
            : { pricePerUnit: -1, createdAt: 1 }; // BUY orders: highest price first

        const matchingOrders = await Order.find(query).sort(sortOrder);

        let remainingQty = quantity - newOrder.filledQuantity;

        for (const matchOrder of matchingOrders) {
            if (remainingQty <= 0) break;

            const matchRemainingQty = matchOrder.quantity - matchOrder.filledQuantity;
            const tradeQuantity = Math.min(remainingQty, matchRemainingQty);

            // Execute trade at the maker's price (the existing order price)
            const executionPrice = matchOrder.pricePerUnit;
            const totalAmount = tradeQuantity * executionPrice;

            // Determine buyer and seller
            const isBuyOrder = type === 'BUY';
            const buyOrderId = isBuyOrder ? newOrder._id : matchOrder._id;
            const sellOrderId = isBuyOrder ? matchOrder._id : newOrder._id;
            const buyerId = isBuyOrder ? userId : matchOrder.userId;
            const sellerId = isBuyOrder ? matchOrder.userId : userId;

            // Create trade record
            const trade = await Trade.create({
                buyOrderId,
                sellOrderId,
                buyerId,
                sellerId,
                quantity: tradeQuantity,
                pricePerUnit: executionPrice,
                totalAmount,
                timestamp: new Date(),
            });

            // Update wallet balances
            await User.findByIdAndUpdate(buyerId, {
                $inc: { walletBalance: -totalAmount }
            });
            await User.findByIdAndUpdate(sellerId, {
                $inc: { walletBalance: totalAmount }
            });

            // Update order filled quantities
            newOrder.filledQuantity += tradeQuantity;
            matchOrder.filledQuantity += tradeQuantity;

            // Update order statuses
            if (newOrder.filledQuantity >= newOrder.quantity) {
                newOrder.status = 'COMPLETED';
            } else if (newOrder.filledQuantity > 0) {
                newOrder.status = 'PARTIAL';
            }

            if (matchOrder.filledQuantity >= matchOrder.quantity) {
                matchOrder.status = 'COMPLETED';
            } else if (matchOrder.filledQuantity > 0) {
                matchOrder.status = 'PARTIAL';
            }

            await matchOrder.save();
            remainingQty -= tradeQuantity;

            // Emit real-time trade event
            io.emit('tradeExecuted', {
                tradeId: trade._id,
                buyerId,
                sellerId,
                quantity: tradeQuantity,
                pricePerUnit: executionPrice,
                totalAmount,
                timestamp: trade.timestamp,
            });

            console.log(`✅ Trade executed: ${tradeQuantity} kWh @ ₹${executionPrice}/kWh`);
        }

        await newOrder.save();
        return newOrder;
    } catch (error) {
        console.error('Matching Engine Error:', error);
        throw error;
    }
};
