# Deployment Guide

This project is ready to be deployed as three connected application services:

1. `frontend/` on Vercel
2. `backend/` on Render
3. `ml_service/` on Render
4. MongoDB Atlas as the cloud database

## Recommended architecture

- **Frontend**: Vercel-hosted Vite and React app
- **Backend**: Render-hosted Express and MongoDB API
- **ML service**: Render-hosted FastAPI service
- **Database**: MongoDB Atlas cluster

## 1. Prepare MongoDB Atlas

Create a MongoDB Atlas cluster and obtain a connection string.

Your backend `MONGO_URI` should look similar to:

```env
mongodb+srv://USERNAME:PASSWORD@cluster-name.xxxxx.mongodb.net/migraine_prediction?retryWrites=true&w=majority
```

## 2. Deploy the FastAPI ML service on Render

Create a new Render web service from this repository.

Use:

- **Root Directory**: `ml_service`
- **Runtime**: `Python`
- **Build Command**:

```bash
pip install -r requirements.txt
```

- **Start Command**:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

After deployment, note the public Render URL. Your backend will use:

```env
ML_SERVICE_URL=https://your-ml-service.onrender.com/predict
```

## 3. Deploy the Express backend on Render

Create a second Render web service from the same repository.

Use:

- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**:

```bash
npm install
```

- **Start Command**:

```bash
npm start
```

Set these environment variables in Render:

```env
PORT=10000
MONGO_URI=your_mongodb_atlas_connection_string
ML_SERVICE_URL=https://your-ml-service.onrender.com/predict
```

After deployment, note the public backend URL.

## 4. Deploy the React frontend on Vercel

Import this GitHub repository into Vercel.

Use:

- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`

Set this environment variable in Vercel:

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com
```

Then deploy.

## 5. Post-deployment checks

After deployment, test:

### Frontend

Open the Vercel URL and submit a prediction form.

### Backend health route

```text
GET https://your-backend-service.onrender.com/
```

Expected response:

```json
{
  "message": "MERN backend is running"
}
```

### ML service health route

```text
GET https://your-ml-service.onrender.com/
```

Expected response:

```json
{
  "message": "Migraine ML prediction service is running"
}
```

## Included deployment helper

This repository includes a `render.yaml` blueprint that can help you create the backend and ML services on Render with less manual setup.

## Important notes

- The ML model files are already saved in `models/`
- No retraining is needed for deployment
- The frontend only communicates with the Express backend
- The Express backend communicates with the FastAPI ML service
- The backend stores prediction history in MongoDB
