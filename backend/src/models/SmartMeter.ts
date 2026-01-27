import mongoose, { Document, Schema } from 'mongoose';

export interface ISmartMeter extends Document {
    userId: mongoose.Types.ObjectId;
    timestamp: Date;
    generation: number;
    consumption: number;
    surplus: number;
}

const smartMeterSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    generation: { type: Number, required: true },
    consumption: { type: Number, required: true },
    surplus: { type: Number, required: true },
});

export default mongoose.model<ISmartMeter>('SmartMeter', smartMeterSchema);
