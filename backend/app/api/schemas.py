from pydantic import BaseModel

class PredictionRequest(BaseModel):
    rainfall: float
    temperature: float
    humidity: float