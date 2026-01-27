import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, (process.env.JWT_SECRET || 'wattswap_secret_key')) as any;

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                res.status(401).json({ message: 'Not authorized, user not found' });
                return;
            }

            // Attach user to request
            (req as any).user = user;

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
            return;
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }
};
