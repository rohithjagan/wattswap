import axios from 'axios';

const AI_SERVICE_URL = 'http://localhost:5001';

export const getPrediction = async (userId: string) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/predict`, {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching prediction:', error);
        throw error;
    }
};

export const getSummary = async (userId: string) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/summary`, {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching prediction summary:', error);
        throw error;
    }
};
