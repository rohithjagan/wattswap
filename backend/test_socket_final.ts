import { io } from 'socket.io-client';
import fs from 'fs';

const socket = io('http://localhost:5000');

console.log('Connecting to socket...');
fs.appendFileSync('socket_test_log.txt', '--- Test Started at ' + new Date().toISOString() + ' ---\n');

socket.on('connect', () => {
    console.log('Connected!');
    fs.appendFileSync('socket_test_log.txt', 'Connected to server\n');
});

socket.on('meterUpdate', (data) => {
    console.log('Received data:', data);
    fs.appendFileSync('socket_test_log.txt', 'Data Received: ' + JSON.stringify(data) + '\n');
});

setTimeout(() => {
    console.log('Test finished.');
    process.exit(0);
}, 15000);
