import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
    console.log('✅ Connected to Socket.IO server');
    console.log('Listening for meterUpdate events...\n');
});

socket.on('meterUpdate', (data) => {
    console.log('📊 Meter Update Received:');
    console.log(`   User ID: ${data.userId}`);
    console.log(`   Generation: ${data.generation} kWh`);
    console.log(`   Consumption: ${data.consumption} kWh`);
    console.log(`   Surplus: ${data.surplus} kWh`);
    console.log(`   Timestamp: ${data.timestamp}\n`);
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});

socket.on('error', (error) => {
    console.error('Socket Error:', error);
});

console.log('🔌 Connecting to http://localhost:5000...');

// Keep the script running
setTimeout(() => {
    console.log('\n--- Test completed after 15 seconds ---');
    socket.disconnect();
    process.exit(0);
}, 15000);
