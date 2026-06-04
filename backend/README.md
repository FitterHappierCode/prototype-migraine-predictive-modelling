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
```

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
- saves the input and prediction to MongoDB
- returns the saved prediction document as JSON

### Get all saved predictions

`GET http://127.0.0.1:5000/api/predictions`

This route returns all saved predictions sorted by newest first.
