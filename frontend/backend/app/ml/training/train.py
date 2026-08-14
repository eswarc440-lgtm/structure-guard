import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

df = pd.read_csv("data/ml_training_data.csv")

features = [
    "age",
    "design_life",
    "elevation_m",
    "slope_deg",
    "flood_risk_value",
    "rainfall_mm",
    "temperature_c",
    "wind_speed_ms"
]

X = df[features].fillna(0)
y = df["risk_score"].fillna(df["risk_score"].median())

model = RandomForestRegressor(
    n_estimators=100,
    max_depth=15,
    random_state=42,
    n_jobs=-1
)

model.fit(X, y)

os.makedirs("app/ml/models", exist_ok=True)

joblib.dump(
    {
        "model": model,
        "features": features
    },
    "app/ml/models/risk_model.joblib"
)

print("AI MODEL TRAINED")
print("Training rows:", len(X))
print("Features:", len(features))
print("Model: RandomForestRegressor")
print("Saved: app/ml/models/risk_model.joblib")
