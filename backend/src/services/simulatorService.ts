import { Server } from 'socket.io';
import User from '../models/User';
import SmartMeter from '../models/SmartMeter';

export const startSimulation = (io: Server) => {
    console.log('--- Smart Meter Simulation Started ---');

    // Run every 5 seconds
    setInterval(async () => {
        try {
            const users = await User.find({ role: 'user' });
            console.log(`Simulation Tick: Found ${users.length} users`);

            if (users.length === 0) {
                console.log('No users with "user" role found for simulation.');
                return;
            }

            for (const user of users) {
                // Simulate Grid Data
                // Simple logic: Day (Surplus), Night (Deficit) + Randomness
                const hour = new Date().getHours();

                let generation = 0;
                let consumption = 0;

                // Solar Generation Logic (Peak 10 AM - 4 PM)
                if (hour >= 6 && hour <= 18) {
                    // Bell curve approximation-ish using simple math
                    const peak = 12;
                    const diff = Math.abs(hour - peak);
                    const generationBase = Math.max(0, 5 - diff * 0.8);
                    generation = +(generationBase + Math.random() * 1).toFixed(2);
                }

                // Consumption Logic (Peak 6 PM - 9 PM, Morning 7 AM - 9 AM)
                const isEveningPeak = hour >= 18 && hour <= 21;
                const isMorningPeak = hour >= 7 && hour <= 9;

                const consumptionBase = isEveningPeak ? 3 : isMorningPeak ? 2 : 1;
                consumption = +(consumptionBase + Math.random() * 1.5).toFixed(2);

                const surplus = +(generation - consumption).toFixed(2);

                // Update User model with cumulative/latest surplus
                // For this MVP, we'll treat 'surplus' as available energy balance
                // If surplus is positive, add to available; if negative, deduct.
                // Resetting or accumulating depends on logic, here we'll just set it
                // to the latest net surplus for simplicity of "current availability".
                user.surplusEnergy = surplus;
                await user.save();

                // Save to DB
                const reading = await SmartMeter.create({
                    userId: user._id,
                    generation,
                    consumption,
                    surplus,
                    timestamp: new Date()
                });

                const dataToEmit = {
                    ...reading.toJSON(),
                    userId: reading.userId.toString()
                };

                // console.log(`Emitting meterUpdate for user ${user._id}:`, dataToEmit);
                console.log(`Emitting meterUpdate for user ${user._id}`);
                io.emit('meterUpdate', dataToEmit);
            }
        } catch (error) {
            console.error('Simulation Error:', error);
        }
    }, 5000); // 5 seconds
};
