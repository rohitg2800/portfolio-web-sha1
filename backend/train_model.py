from pathlib import Path
import joblib
from sklearn.ensemble import RandomForestClassifier

# Dummy example model
model = RandomForestClassifier()

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "app" / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "flood_model.pkl"

joblib.dump(model, MODEL_PATH)

print(f"Model saved at {MODEL_PATH}")