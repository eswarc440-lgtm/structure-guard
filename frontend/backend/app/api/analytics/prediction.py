from fastapi import APIRouter
from app.ml.prediction.predict import predict_risk

router = APIRouter(prefix="/prediction", tags=["AI Prediction"])


@router.post("/predict")
def predict(data: dict):
    return predict_risk(data)
