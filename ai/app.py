from flask import Flask, jsonify, request
from flask_cors import CORS
from model import EnergyPredictor
import os

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

predictor = EnergyPredictor()

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "AI Service Running", "version": "1.0.0"})

@app.route('/predict', methods=['GET'])
def predict():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "userId is required"}), 400
        
    try:
        data = predictor.predict_next_24h(user_id)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/summary', methods=['GET'])
def summary():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "userId is required"}), 400
        
    try:
        data = predictor.get_summary(user_id)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"--- AI Prediction Service ---")
    print(f"Running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
