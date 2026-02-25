from fastapi import APIRouter
from app.api.schemas import PredictionRequest
from app.services.prediction import run_prediction

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/predict")
def predict(data: PredictionRequest):
    return run_prediction(data)