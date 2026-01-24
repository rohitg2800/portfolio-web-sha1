from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Save your trained model
import joblib
joblib.dump(model, 'flood_model.pkl')

app = FastAPI(title="Flood Prediction API")

# ✅ CORS allow GitHub Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "ok", "message": "Flood API is LIVE"}

@app.post("/predict")
def predict(payload: dict):
    # TEMP response to verify frontend connectivity
    return {
        "severity": "Medium",
        "confidence": 0.58,
        "recommendation": "API connected successfully. Replace this with ML output."
    }
