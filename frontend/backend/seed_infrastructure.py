from app.database.database import SessionLocal
from app.models.infrastructure import InfrastructureAsset

assets = [
    {
        "id": "BR-001",
        "name": "Prakasam Barrage",
        "asset_type": "Barrage",
        "location": "Vijayawada",
        "district": "NTR",
        "latitude": 16.5165,
        "longitude": 80.6150,
        "built_year": 1957,
        "design_life": 100,
        "condition": "Good",
        "health_score": 89,
        "risk_level": "Low",
        "risk_score": 18,
        "remaining_useful_life": 18,
        "owner": "Government",
        "material": "Concrete",
        "status": "Operational",
        "source": "Initial AP Infrastructure Dataset",
        "source_id": "AP-001"
    },
    {
        "id": "BR-002",
        "name": "Godavari Bridge",
        "asset_type": "Bridge",
        "location": "Rajahmundry",
        "district": "East Godavari",
        "latitude": 17.0005,
        "longitude": 81.7768,
        "built_year": 1974,
        "design_life": 75,
        "condition": "Warning",
        "health_score": 71,
        "risk_level": "High",
        "risk_score": 78,
        "remaining_useful_life": 7,
        "owner": "Government",
        "material": "Steel and Concrete",
        "status": "Under Inspection",
        "source": "Initial AP Infrastructure Dataset",
        "source_id": "AP-002"
    },
    {
        "id": "DM-001",
        "name": "Polavaram Project",
        "asset_type": "Dam",
        "location": "Polavaram",
        "district": "Eluru",
        "latitude": 17.2646,
        "longitude": 81.6435,
        "built_year": 2025,
        "design_life": 100,
        "condition": "Good",
        "health_score": 90,
        "risk_level": "Medium",
        "risk_score": 35,
        "remaining_useful_life": 80,
        "owner": "Government",
        "material": "Concrete",
        "status": "Operational",
        "source": "Initial AP Infrastructure Dataset",
        "source_id": "AP-003"
    },
    {
        "id": "AP-001",
        "name": "Vijayawada Airport",
        "asset_type": "Airport",
        "location": "Gannavaram",
        "district": "Krishna",
        "latitude": 16.5304,
        "longitude": 80.7968,
        "built_year": 1981,
        "design_life": 50,
        "condition": "Good",
        "health_score": 86,
        "risk_level": "Low",
        "risk_score": 22,
        "remaining_useful_life": 15,
        "owner": "AAI",
        "material": "Concrete",
        "status": "Operational",
        "source": "Initial AP Infrastructure Dataset",
        "source_id": "AP-004"
    },
    {
        "id": "PT-001",
        "name": "Visakhapatnam Port",
        "asset_type": "Port",
        "location": "Visakhapatnam",
        "district": "Visakhapatnam",
        "latitude": 17.6868,
        "longitude": 83.2185,
        "built_year": 1933,
        "design_life": 100,
        "condition": "Good",
        "health_score": 84,
        "risk_level": "Medium",
        "risk_score": 38,
        "remaining_useful_life": 20,
        "owner": "Visakhapatnam Port Authority",
        "material": "Mixed",
        "status": "Operational",
        "source": "Initial AP Infrastructure Dataset",
        "source_id": "AP-005"
    },
]

db = SessionLocal()

try:
    for item in assets:
        existing = db.query(InfrastructureAsset).filter(
            InfrastructureAsset.id == item["id"]
        ).first()

        if not existing:
            db.add(InfrastructureAsset(**item))

    db.commit()
    print(f"Successfully seeded {len(assets)} infrastructure assets.")

except Exception as e:
    db.rollback()
    print("ERROR:", e)

finally:
    db.close()