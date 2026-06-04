from datetime import date
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "migraine_gradient_boosting_model.joblib"
FEATURE_PATH = BASE_DIR / "models" / "feature_names.joblib"

model = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURE_PATH)

app = FastAPI(title="Migraine ML Prediction Service")


class PredictionRequest(BaseModel):
    sleep_hours: float = Field(..., ge=0)
    mood_level: int = Field(..., ge=0)
    stress_level: int = Field(..., ge=0)
    hydration_level: int = Field(..., ge=0)
    screen_time: float = Field(..., ge=0)
    date: date


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Migraine ML prediction service is running"}


@app.post("/predict")
def predict(payload: PredictionRequest) -> dict[str, float | int | str]:
    day_of_week = payload.date.weekday()
    month = payload.date.month

    input_row = {
        "sleep_hours": payload.sleep_hours,
        "mood_level": payload.mood_level,
        "stress_level": payload.stress_level,
        "hydration_level": payload.hydration_level,
        "screen_time": payload.screen_time,
        "day_of_week": day_of_week,
        "month": month,
        "sleep_stress_interaction": payload.sleep_hours * payload.stress_level,
        "screen_stress_interaction": payload.screen_time * payload.stress_level,
        "hydration_stress_interaction": payload.hydration_level * payload.stress_level,
    }

    input_df = pd.DataFrame([input_row])[feature_names]

    prediction = int(model.predict(input_df)[0])
    probability = float(model.predict_proba(input_df)[0][1])
    risk_label = "High migraine risk" if prediction == 1 else "Low migraine risk"

    return {
        "prediction": prediction,
        "risk_label": risk_label,
        "probability": round(probability, 2),
    }
