from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import joblib

# -------------------------------
# App Initialization
# -------------------------------
app = FastAPI(title="Flood Prediction API", version="1.0.0")

# -------------------------------
# CORS Configuration
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Load ML Model (Safe Path Logic)
# -------------------------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "flood_model.pkl"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

model = joblib.load(MODEL_PATH)

# -------------------------------
# Request Schema
# -------------------------------
class PredictionRequest(BaseModel):
    rainfall: float
    temperature: float
    humidity: float

# -------------------------------
# Health Endpoint
# -------------------------------
@app.get("/api/v1/health")
def health():
    return {"status": "healthy", "model_loaded": True}

# -------------------------------
# Prediction Endpoint
# -------------------------------
@app.post("/api/v1/predict")
def predict(data: PredictionRequest):
    try:
        features = [[
            data.rainfall,
            data.temperature,
            data.humidity
        ]]

        prediction = model.predict(features)[0]
        probability = model.predict_proba(features).max()

        severity = "High" if prediction == 1 else "Low"

        return {
            "severity": severity,
            "confidence": round(float(probability), 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))