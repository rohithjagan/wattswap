import { Request, Response } from 'express';
import { getPrediction, getSummary } from '../services/predictionService';

export const getForecast = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const data = await getPrediction(userId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch forecast' });
    }
};

export const getForecastSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const data = await getSummary(userId);
        res.json(data);
    } catch (error: any) {
        console.error('Forecast Summary Error:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch forecast summary' });
    }
};
