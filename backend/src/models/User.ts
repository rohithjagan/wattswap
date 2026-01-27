import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    walletBalance: number;
    surplusEnergy: number;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    walletBalance: { type: Number, default: 0 },
    surplusEnergy: { type: Number, default: 0 },
}, {
    timestamps: true,
});

userSchema.pre('save', async function () {
    const user = this as any;
    if (!user.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
    const user = this as any;
    return await bcrypt.compare(enteredPassword, user.password);
};

export default mongoose.model<IUser>('User', userSchema);
