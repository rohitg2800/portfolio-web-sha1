from pathlib import Path
import joblib

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "flood_model.pkl"

model = joblib.load(MODEL_PATH)

def run_prediction(data):
    features = [[data.rainfall, data.temperature, data.humidity]]
    prediction = model.predict(features)[0]

    return {
        "severity": str(prediction),
        "confidence": 0.85,
        "recommendation": "Model prediction successful."
    }