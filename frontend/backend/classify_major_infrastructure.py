from sqlalchemy import text
from app.database.database import engine

RULES = {
    "Dam": [
        "dam",
        "reservoir",
        "irrigation project",
    ],
    "Barrage": [
        "barrage",
        "anicut",
    ],
    "Bridge": [
        "bridge",
        "flyover",
        "viaduct",
    ],
    "Port": [
        "port",
        "harbour",
        "harbor",
    ],
    "Road": [
        "road",
        "highway",
        "expressway",
        "bypass",
    ],
    "Building": [
        "building",
        "government building",
        "office building",
    ],
    "Airport": [
        "airport",
        "airfield",
    ],
    "Power Plant": [
        "power plant",
        "thermal power",
        "hydro power",
        "power station",
        "substation",
    ],
}

conn = engine.connect()

try:
    print("=== MAJOR INFRASTRUCTURE CLASSIFICATION ===")

    for asset_type, keywords in RULES.items():
        conditions = " OR ".join(
            ["LOWER(COALESCE(name,'')) LIKE :k" + str(i)
             for i in range(len(keywords))]
        )

        params = {
            "k" + str(i): "%" + keyword.lower() + "%"
            for i, keyword in enumerate(keywords)
        }

        result = conn.execute(
            text(f"""
                SELECT COUNT(*)
                FROM infrastructure_assets
                WHERE {conditions}
            """),
            params,
        ).scalar()

        print(f"{asset_type}: {result}")

    print()
    print("=== EXISTING MAJOR ASSET TYPES ===")

    rows = conn.execute(
        text("""
            SELECT asset_type, COUNT(*) AS total
            FROM infrastructure_assets
            WHERE LOWER(asset_type) IN (
                'dam',
                'barrage',
                'bridge',
                'port',
                'road',
                'building',
                'airport',
                'power plant',
                'powerplant'
            )
            GROUP BY asset_type
            ORDER BY total DESC
        """)
    ).fetchall()

    for row in rows:
        print(row)

finally:
    conn.close()
