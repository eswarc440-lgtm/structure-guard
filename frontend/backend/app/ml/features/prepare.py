from sqlalchemy import text
from app.database.database import engine
import pandas as pd

QUERY = """
SELECT
    built_year,
    design_life,
    elevation_m,
    slope_deg,
    flood_risk_value,
    rainfall_mm,
    temperature_c,
    wind_speed_ms,
    health_score,
    risk_score,
    remaining_life
FROM infrastructure_assets
WHERE health_score IS NOT NULL
  AND risk_score IS NOT NULL
  AND remaining_life IS NOT NULL
LIMIT 100000
"""

with engine.connect() as conn:
    df = pd.read_sql(text(QUERY), conn)

df["age"] = 2026 - df["built_year"]
df["age"] = df["age"].clip(lower=0)

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

df[features + ["health_score", "risk_score", "remaining_life"]].to_csv(
    "data/ml_training_data.csv",
    index=False
)

print("ML dataset created")
print("Rows:", len(df))
print("Columns:", len(df.columns))
