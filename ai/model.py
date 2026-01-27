import numpy as np
import random
from datetime import datetime, timedelta

class EnergyPredictor:
    def __init__(self):
        pass

    def predict_next_24h(self, user_id):
        """
        Generates synthetic prediction data for the next 24 hours.
        Returns a list of hourly predictions for generation and consumption.
        """
        predictions = []
        now = datetime.now()
        
        # Base consumption profile (peaks morning/evening)
        base_consumption = 2.0  # kWh
        
        for i in range(24):
            future_time = now + timedelta(hours=i)
            hour = future_time.hour
            
            # Solar Generation Model (Bell curve peaking at 13:00)
            if 6 <= hour <= 18:
                # Gaussian-like curve
                peak = 13
                sigma = 3
                generation = 5.0 * np.exp(-((hour - peak) ** 2) / (2 * sigma ** 2))
                # Add random cloud cover noise
                generation *= random.uniform(0.8, 1.1)
                generation = max(0, generation)
            else:
                generation = 0.0

            # Consumption Model
            # Morning peak (7-9), Evening peak (18-21)
            consumption = base_consumption
            if 7 <= hour <= 9:
                consumption += random.uniform(1.0, 2.0)
            elif 18 <= hour <= 21:
                consumption += random.uniform(1.5, 2.5)
            else:
                consumption += random.uniform(-0.5, 0.5)
                
            consumption = max(0.5, consumption) # Min baseline

            predictions.append({
                "hour": future_time.strftime("%H:00"),
                "timestamp": future_time.isoformat(),
                "predictedGeneration": round(generation, 2),
                "predictedConsumption": round(consumption, 2),
                "predictedSurplus": round(generation - consumption, 2)
            })
            
        return predictions

    def get_summary(self, user_id):
        """Returns a summary for the next day"""
        data = self.predict_next_24h(user_id)
        total_gen = sum(p['predictedGeneration'] for p in data)
        total_con = sum(p['predictedConsumption'] for p in data)
        
        return {
            "totalGeneration": round(total_gen, 2),
            "totalConsumption": round(total_con, 2),
            "netSurplus": round(total_gen - total_con, 2),
            "recommendation": "SELL" if total_gen > total_con else "BUY"
        }
