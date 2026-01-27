import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'wattswap_secret_key', {
        expiresIn: '30d',
    });
};

export default generateToken;
