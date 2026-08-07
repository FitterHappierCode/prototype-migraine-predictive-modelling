from datetime import date
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "migraine_gradient_boosting_model.joblib"
FEATURE_PATH = BASE_DIR / "models" / "feature_names.joblib"
HEADACHE_DIARY_MODEL_PATH = (
    BASE_DIR / "models" / "headache_diary_random_forest_model.joblib"
)
HEADACHE_DIARY_FEATURE_PATH = BASE_DIR / "models" / "headache_diary_feature_names.joblib"

model = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURE_PATH)
headache_diary_model = joblib.load(HEADACHE_DIARY_MODEL_PATH)
headache_diary_feature_names = joblib.load(HEADACHE_DIARY_FEATURE_PATH)

app = FastAPI(title="Migraine ML Prediction Service")


class PredictionRequest(BaseModel):
    sleep_hours: float = Field(..., ge=0)
    mood_level: int = Field(..., ge=0)
    stress_level: int = Field(..., ge=0)
    hydration_level: int = Field(..., ge=0)
    screen_time: float = Field(..., ge=0)
    date: date


class HeadacheDiaryPredictionRequest(BaseModel):
    preventive_medication_use: int = Field(0, ge=0, le=1)
    stress: int = Field(0, ge=0, le=1)
    excess_sleep: int = Field(0, ge=0, le=1)
    sleep_deprivation: int = Field(0, ge=0, le=1)
    exercise_trigger: int = Field(0, ge=0, le=1)
    no_exercise: int = Field(0, ge=0, le=1)
    physical_fatigue: int = Field(0, ge=0, le=1)
    menstrual_phase: int = Field(0, ge=0, le=1)
    ovulation_phase: int = Field(0, ge=0, le=1)
    emotional_change: int = Field(0, ge=0, le=1)
    weather_temperature_change: int = Field(0, ge=0, le=1)
    excessive_sunlight: int = Field(0, ge=0, le=1)
    noise: int = Field(0, ge=0, le=1)
    inappropriate_lighting: int = Field(0, ge=0, le=1)
    specific_smell: int = Field(0, ge=0, le=1)
    excess_alcohol: int = Field(0, ge=0, le=1)
    irregular_meals: int = Field(0, ge=0, le=1)
    overeating: int = Field(0, ge=0, le=1)
    excess_caffeine: int = Field(0, ge=0, le=1)
    excess_smoking: int = Field(0, ge=0, le=1)
    cheese_chocolate: int = Field(0, ge=0, le=1)
    travel: int = Field(0, ge=0, le=1)
    other_trigger: int = Field(0, ge=0, le=1)
    exercise_status: int = Field(0, ge=0, le=1)
    vigorous_exercise: int = Field(0, ge=0, le=1)
    moderate_exercise: int = Field(0, ge=0, le=1)


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


@app.post("/predict-headache-diary")
def predict_headache_diary(
    payload: HeadacheDiaryPredictionRequest,
) -> dict[str, float | int | str]:
    internal_total = (
        payload.stress
        + payload.excess_sleep
        + payload.sleep_deprivation
        + payload.exercise_trigger
        + payload.no_exercise
        + payload.physical_fatigue
        + payload.menstrual_phase
        + payload.ovulation_phase
        + payload.emotional_change
    )
    external_total = (
        payload.weather_temperature_change
        + payload.excessive_sunlight
        + payload.noise
        + payload.inappropriate_lighting
        + payload.specific_smell
    )
    other_total = (
        payload.excess_alcohol
        + payload.irregular_meals
        + payload.overeating
        + payload.excess_caffeine
        + payload.excess_smoking
        + payload.cheese_chocolate
        + payload.travel
        + payload.other_trigger
    )
    exercise_total = payload.vigorous_exercise + payload.moderate_exercise
    trigger_total = internal_total + external_total + other_total

    input_row = {
        "Preventive medication use": payload.preventive_medication_use,
        "Trigger factors - Number of triggers": trigger_total,
        "Internal factors - Stress": payload.stress,
        "Internal factors - Excess sleep": payload.excess_sleep,
        "Internal factors - Sleep deprivation": payload.sleep_deprivation,
        "Internal factors - Exercise": payload.exercise_trigger,
        "Internal factors - No exercise": payload.no_exercise,
        "Internal factors - Physical fatigue": payload.physical_fatigue,
        "Internal factors - Menstrual phase": payload.menstrual_phase,
        "Internal factors - Ovulation phase": payload.ovulation_phase,
        "Internal factors - Excessive emotional change": payload.emotional_change,
        "Internal factors - Total": internal_total,
        "External factors - Weather/temperature change": payload.weather_temperature_change,
        "External factors - Excessive sunlight": payload.excessive_sunlight,
        "External factors - Noise": payload.noise,
        "External factors - Inappropriate lighting": payload.inappropriate_lighting,
        "External factors - Specific smell (cosmetics/perfume etc.)": payload.specific_smell,
        "External factors - Total": external_total,
        "Other - Excess alcohol": payload.excess_alcohol,
        "Other - Irregular meals/fasting": payload.irregular_meals,
        "Other - Overeating": payload.overeating,
        "Other - Excess caffeine drinks": payload.excess_caffeine,
        "Other - Excess smoking": payload.excess_smoking,
        "Other - Cheese/chocolate": payload.cheese_chocolate,
        "Other - Travel": payload.travel,
        "Other_2": payload.other_trigger,
        "Other - Total": other_total,
        "Exercise status": payload.exercise_status,
        "Exercise intensity - Vigorous exercise": payload.vigorous_exercise,
        "Exercise intensity - Moderate exercise": payload.moderate_exercise,
        "Exercise intensity - Total": exercise_total,
    }

    input_df = pd.DataFrame([input_row])[headache_diary_feature_names]

    prediction = int(headache_diary_model.predict(input_df)[0])
    probability = float(headache_diary_model.predict_proba(input_df)[0][1])
    risk_label = "Headache day risk" if prediction == 1 else "Headache-free day likely"

    return {
        "prediction": prediction,
        "risk_label": risk_label,
        "probability": round(probability, 2),
    }
