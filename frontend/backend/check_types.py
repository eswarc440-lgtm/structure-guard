from sqlalchemy import text
from app.database.database import engine

conn = engine.connect()

rows = conn.execute(
    text("""
        SELECT asset_type, COUNT(*) AS total
        FROM infrastructure_assets
        GROUP BY asset_type
        ORDER BY total DESC
    """)
).fetchall()

for row in rows:
    print(row)

conn.close()
