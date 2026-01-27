import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'BUY' | 'SELL';
    quantity: number;
    pricePerUnit: number;
    status: 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED';
    filledQuantity: number;
    createdAt: Date;
}

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true, min: 0.01 },
    pricePerUnit: { type: Number, required: true, min: 0.01 },
    status: {
        type: String,
        enum: ['PENDING', 'PARTIAL', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    filledQuantity: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

// Index for faster matching queries
orderSchema.index({ type: 1, status: 1, pricePerUnit: -1, createdAt: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);
