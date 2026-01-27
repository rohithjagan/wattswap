import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import tradeRoutes from './routes/tradeRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { startSimulation } from './services/simulatorService';

dotenv.config();

connectDB();

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all for dev
        methods: ['GET', 'POST'],
    },
});

// Export io for use in controllers
let ioInstance: Server;
export const getIO = () => {
    if (!ioInstance) {
        throw new Error('Socket.IO not initialized');
    }
    return ioInstance;
};
ioInstance = io;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Watt-Swap API is running...');
});



app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Socket Disconnected: ${socket.id}`);
    });
});

// Start Simulation
startSimulation(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
