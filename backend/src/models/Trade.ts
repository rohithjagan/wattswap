import mongoose, { Document, Schema } from 'mongoose';

export interface ITrade extends Document {
    buyOrderId: mongoose.Types.ObjectId;
    sellOrderId: mongoose.Types.ObjectId;
    buyerId: mongoose.Types.ObjectId;
    sellerId: mongoose.Types.ObjectId;
    quantity: number;
    pricePerUnit: number;
    totalAmount: number;
    timestamp: Date;
}

const tradeSchema = new Schema({
    buyOrderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    sellOrderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<ITrade>('Trade', tradeSchema);
