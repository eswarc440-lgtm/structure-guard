import joblib
import pandas as pd
import logging
import os

logger = logging.getLogger(__name__)

# Load model path from environment or use default
MODEL_PATH = os.getenv("ML_MODEL_PATH", "app/ml/models/risk_model.joblib")

# Global model variables
model = None
features = None
_model_loaded = False
_load_error = None


def _load_model():
    """Load ML model on first use"""
    global model, features, _model_loaded, _load_error
    
    if _model_loaded:
        if _load_error:
            raise RuntimeError(f"ML model failed to load: {_load_error}")
        return
    
    try:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        
        bundle = joblib.load(MODEL_PATH)
        model = bundle["model"]
        features = bundle["features"]
        _model_loaded = True
        logger.info(f"ML model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        _model_loaded = True
        _load_error = str(e)
        logger.error(f"Failed to load ML model from {MODEL_PATH}: {str(e)}")
        raise


def predict_risk(data):
    """Predict risk score for infrastructure asset"""
    try:
        _load_model()
        
        df = pd.DataFrame([data])

        df["age"] = 2026 - df["built_year"]
        df["age"] = df["age"].clip(lower=0)

        X = df[features].fillna(0)

        risk_score = float(model.predict(X)[0])
        risk_score = max(0, min(100, risk_score))

        if risk_score >= 70:
            risk_level = "High"
        elif risk_score >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return {
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level
        }
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        raise
