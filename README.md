# Prototype Migraine Predictive Modelling

This project is an MSc AI prototype for predicting migraine or headache occurrence from self-reported lifestyle features. It combines dataset analysis, model development, a Python machine-learning prediction service, an Express and MongoDB backend, and a React frontend for demo use.

## Project overview

The system follows a simple full-stack prediction workflow:

1. A user enters lifestyle details in the React frontend.
2. The frontend sends the data to the Express backend.
3. The backend calls the Python FastAPI machine-learning service.
4. The ML service generates a prediction and probability score.
5. The backend saves both the user input and the ML result to MongoDB.
6. The frontend displays the prediction result and recent history.

## Final selected model

The selected final model is `Gradient Boosting`, chosen after baseline training and model improvement experiments.

- Final development-stage F1-score: `0.5866`
- Final development-stage ROC-AUC: `0.6412`

## Disclaimer

This prototype is for educational and research purposes only. It is not a medical diagnosis tool.

## Repository structure

```text
backend/      Express and MongoDB API
data/         Dataset CSV
frontend/     Vite and React frontend
ml_service/   FastAPI prediction service
models/       Saved model and feature list
notebooks/    Data checking, training, improvement, and model saving notebooks
reports/      Report outputs and supporting documents
```

## Local development

### 1. Python ML service

From `ml_service/`:

```bash
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Express backend

From `backend/`:

```bash
npm install
npm run dev
```

The backend uses:

- `PORT`
- `MONGO_URI`
- `ML_SERVICE_URL`

See [backend/.env.example](backend/.env.example).

### 3. React frontend

From `frontend/`:

```bash
npm install
npm run dev
```

The frontend uses:

- `VITE_API_BASE_URL`

See [frontend/.env.example](frontend/.env.example).

## Notebooks completed

- `01_migraine_dataset_check.ipynb`
- `02_baseline_model_training.ipynb`
- `03_model_improvement.ipynb`
- `04_save_final_model.ipynb`

## Deployment summary

Recommended deployment setup:

- `frontend/` -> Vercel
- `backend/` -> Render Web Service
- `ml_service/` -> Render Web Service
- Database -> MongoDB Atlas

Deployment preparation files included in this repository:

- [render.yaml](render.yaml)
- [DEPLOYMENT.md](DEPLOYMENT.md)

## Useful links

- Frontend guide: [frontend/README.md](frontend/README.md)
- Backend guide: [backend/README.md](backend/README.md)
- Deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
