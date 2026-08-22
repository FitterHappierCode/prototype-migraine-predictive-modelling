# Backend Setup and Testing Guide

This backend receives user lifestyle data, sends it to the Python ML prediction service, saves both the input and prediction result in MongoDB, and returns the saved document.

## How to run the backend

### Step 1

```bash
cd backend
```

### Step 2

```bash
npm install
```

### Step 3

Create a `.env` file based on `.env.example`.

### Step 4

Make sure the Python ML service is running on port `8000`.

### Step 5

Make sure MongoDB is running locally, or replace `MONGO_URI` with your MongoDB Atlas connection string.

### Step 6

```bash
npm run dev
```

## Environment variables

Use the following values in your `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/migraine_prediction
ML_SERVICE_URL=http://127.0.0.1:8000/predict
HEADACHE_DIARY_ML_SERVICE_URL=http://127.0.0.1:8000/predict-headache-diary
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

`OPENAI_API_KEY` is optional. If it is provided, the backend asks OpenAI to write a short non-diagnostic self-management note after each prediction. If it is not provided, the backend uses a safe rule-based explanation instead.

For deployment, add `OPENAI_API_KEY` and `OPENAI_MODEL` in the Render backend service environment variables. Do not add the API key to GitHub or commit it into `.env`.

The headache diary demo groups trigger inputs into medication, sleep/fatigue, stress/emotional, environmental, diet/substance, activity, hormonal and other factors. The sex/gender field is currently used to show relevant diary questions and to support future subgroup analysis; it is not used as a deployed model feature. Hormonal questions are only shown when Female is selected.

## Test routes

### Health check

`GET http://127.0.0.1:5000/`

Expected response:

```json
{
  "message": "MERN backend is running"
}
```

### Create a prediction

`POST http://127.0.0.1:5000/api/predictions`

Sample JSON body:

```json
{
  "sleep_hours": 5,
  "mood_level": 3,
  "stress_level": 8,
  "hydration_level": 2,
  "screen_time": 9,
  "date": "2026-06-04"
}
```

This route:
- sends the input to the Python ML service
- receives the prediction result
- creates a short self-management explanation
- saves the input and prediction to MongoDB
- returns the saved prediction document as JSON

### Backend and MongoDB health

`GET http://127.0.0.1:5000/api/health`

This route confirms whether the backend is running and whether MongoDB is configured and connected. It does not expose the MongoDB password or full connection string.

### Get all saved predictions

`GET http://127.0.0.1:5000/api/predictions`

This route returns all saved predictions sorted by newest first.
