import { createContext, useEffect, useState, useContext, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface MeterData {
    userId: string;
    generation: number;
    consumption: number;
    surplus: number;
    timestamp: string;
}

interface SocketContextType {
    socket: Socket | null;
    meterData: MeterData | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [meterData, setMeterData] = useState<MeterData | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to Socket.IO server
        const newSocket = io('http://localhost:5000');

        newSocket.on('connect', () => {
            console.log('Connected to Socket.IO');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO');
            setIsConnected(false);
        });

        // Listen for meter updates
        newSocket.on('meterUpdate', (data: MeterData) => {
            // Unified data for demo purposes - updates regardless of ID matching
            // This ensures the USER sees the simulation energy moving immediately.
            setMeterData(data);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, meterData, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
