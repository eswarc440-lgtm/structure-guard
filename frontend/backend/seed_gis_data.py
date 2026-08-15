"""
Seed GIS layers with Andhra Pradesh districts, mandals, and villages.
This script populates the district, mandal, and village tables with real Andhra Pradesh data.
"""

import sys
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2 import Geography
from app.database.database import SessionLocal, engine
from app.models.gis_and_analytics import District, Mandal, Village
from app.models.infrastructure import InfrastructureAsset

# Simplified Andhra Pradesh districts with approximate center coordinates
DISTRICTS_DATA = [
    {
        "name": "Visakhapatnam",
        "headquarters": "Visakhapatnam City",
        "lat": 17.6869,
        "lon": 83.2185,
    },
    {
        "name": "Vizianagaram",
        "headquarters": "Vizianagaram",
        "lat": 17.7793,
        "lon": 83.2200,
    },
    {
        "name": "Vikarabad",
        "headquarters": "Vikarabad",
        "lat": 17.3530,
        "lon": 83.1330,
    },
    {
        "name": "Krishna",
        "headquarters": "Machilipatnam",
        "lat": 15.7942,
        "lon": 81.1270,
    },
    {
        "name": "Guntur",
        "headquarters": "Guntur City",
        "lat": 16.3067,
        "lon": 80.4365,
    },
    {
        "name": "Prakasam",
        "headquarters": "Ongole",
        "lat": 14.6349,
        "lon": 79.6294,
    },
    {
        "name": "Nellore",
        "headquarters": "Nellore",
        "lat": 14.4405,
        "lon": 79.9864,
    },
    {
        "name": "Chittoor",
        "headquarters": "Chittoor",
        "lat": 13.1939,
        "lon": 79.1022,
    },
    {
        "name": "Kadapa",
        "headquarters": "Kadapa",
        "lat": 13.9211,
        "lon": 78.8537,
    },
    {
        "name": "Ananthapur",
        "headquarters": "Ananthapur",
        "lat": 13.8738,
        "lon": 77.6041,
    },
    {
        "name": "Kurnool",
        "headquarters": "Kurnool City",
        "lat": 15.8281,
        "lon": 78.8353,
    },
    {
        "name": "Rajampet",
        "headquarters": "Rajampet",
        "lat": 13.4667,
        "lon": 79.3833,
    },
    {
        "name": "West Godavari",
        "headquarters": "Bhimavaram",
        "lat": 16.5204,
        "lon": 81.5233,
    },
    {
        "name": "East Godavari",
        "headquarters": "Kakinada",
        "lat": 16.9891,
        "lon": 82.2475,
    },
]

# Sample mandals for each district
MANDALS_DATA = {
    "Visakhapatnam": [
        {"name": "Visakhapatnam", "lat": 17.6869, "lon": 83.2185},
        {"name": "Anakapalli", "lat": 17.6674, "lon": 83.0084},
        {"name": "Atchutapuram", "lat": 17.7082, "lon": 83.4467},
        {"name": "Chintapalli", "lat": 17.8845, "lon": 82.6190},
        {"name": "Narsipatnam", "lat": 17.8119, "lon": 83.0969},
    ],
    "Krishna": [
        {"name": "Machilipatnam", "lat": 15.7942, "lon": 81.1270},
        {"name": "Vijayawada", "lat": 16.5062, "lon": 80.6480},
        {"name": "Challapalli", "lat": 15.8639, "lon": 81.0969},
        {"name": "Ibrahimpatnam", "lat": 16.0197, "lon": 80.8906},
    ],
    "Guntur": [
        {"name": "Guntur", "lat": 16.3067, "lon": 80.4365},
        {"name": "Tenali", "lat": 15.6800, "lon": 80.6300},
        {"name": "Bapatla", "lat": 15.8988, "lon": 80.1956},
        {"name": "Narasaraopet", "lat": 15.5184, "lon": 80.1353},
    ],
    "Prakasam": [
        {"name": "Ongole", "lat": 14.6349, "lon": 79.6294},
        {"name": "Chirala", "lat": 14.2176, "lon": 79.8392},
        {"name": "Markapur", "lat": 14.7168, "lon": 79.2728},
        {"name": "Giddalur", "lat": 14.3333, "lon": 78.9333},
    ],
    "Chittoor": [
        {"name": "Chittoor", "lat": 13.1939, "lon": 79.1022},
        {"name": "Tirupati", "lat": 13.1827, "lon": 79.4625},
        {"name": "Madanapalle", "lat": 13.3067, "lon": 78.5064},
        {"name": "Palamaner", "lat": 13.0944, "lon": 79.1169},
    ],
    "Kadapa": [
        {"name": "Kadapa", "lat": 13.9211, "lon": 78.8537},
        {"name": "Proddatur", "lat": 14.7500, "lon": 78.5722},
        {"name": "Rajampet", "lat": 13.4667, "lon": 79.3833},
        {"name": "Jammalamadugu", "lat": 14.0667, "lon": 78.8000},
    ],
    "Nellore": [
        {"name": "Nellore", "lat": 14.4405, "lon": 79.9864},
        {"name": "Gudur", "lat": 14.2625, "lon": 79.9375},
        {"name": "Tirupati", "lat": 13.1827, "lon": 79.4625},
        {"name": "Sullurpeta", "lat": 13.8500, "lon": 79.7500},
    ],
    "Ananthapur": [
        {"name": "Ananthapur", "lat": 13.8738, "lon": 77.6041},
        {"name": "Kadiri", "lat": 13.8172, "lon": 77.4239},
        {"name": "Hindupur", "lat": 13.5235, "lon": 77.4714},
        {"name": "Puttaparthi", "lat": 13.7767, "lon": 77.7650},
    ],
    "Kurnool": [
        {"name": "Kurnool", "lat": 15.8281, "lon": 78.8353},
        {"name": "Adoni", "lat": 15.6337, "lon": 78.4700},
        {"name": "Nandyal", "lat": 14.4667, "lon": 78.4833},
        {"name": "Panyam", "lat": 15.4667, "lon": 78.5167},
    ],
    "East Godavari": [
        {"name": "Kakinada", "lat": 16.9891, "lon": 82.2475},
        {"name": "Rajahmundry", "lat": 17.0667, "lon": 81.8000},
        {"name": "Amalapuram", "lat": 16.5686, "lon": 81.8628},
        {"name": "Palakollu", "lat": 16.8089, "lon": 81.4914},
    ],
    "West Godavari": [
        {"name": "Bhimavaram", "lat": 16.5204, "lon": 81.5233},
        {"name": "Eluru", "lat": 16.7077, "lon": 81.0875},
        {"name": "Tanuku", "lat": 16.7611, "lon": 81.5717},
        {"name": "Palacole", "lat": 16.6833, "lon": 82.2333},
    ],
}

# Sample villages/towns for selected mandals
VILLAGES_DATA = {
    ("Visakhapatnam", "Visakhapatnam"): [
        {"name": "Visakhapatnam City", "lat": 17.6869, "lon": 83.2185},
        {"name": "Madhurawada", "lat": 17.6753, "lon": 83.2264},
        {"name": "Gajuwaka", "lat": 17.6539, "lon": 83.2653},
    ],
    ("Visakhapatnam", "Anakapalli"): [
        {"name": "Anakapalli", "lat": 17.6674, "lon": 83.0084},
        {"name": "Atchutapuram", "lat": 17.7082, "lon": 83.4467},
    ],
    ("Krishna", "Machilipatnam"): [
        {"name": "Machilipatnam", "lat": 15.7942, "lon": 81.1270},
        {"name": "Paritala", "lat": 15.8333, "lon": 81.0833},
    ],
    ("Krishna", "Vijayawada"): [
        {"name": "Vijayawada", "lat": 16.5062, "lon": 80.6480},
        {"name": "Benz Circle", "lat": 16.5083, "lon": 80.6426},
    ],
    ("Guntur", "Guntur"): [
        {"name": "Guntur City", "lat": 16.3067, "lon": 80.4365},
        {"name": "Ponnur", "lat": 16.2667, "lon": 80.4167},
    ],
    ("Guntur", "Tenali"): [
        {"name": "Tenali", "lat": 15.6800, "lon": 80.6300},
        {"name": "Repalle", "lat": 15.6833, "lon": 80.4667},
    ],
}


def create_polygon_from_point(lat, lon, scale=0.5):
    """Create a simple square polygon around a point."""
    # scale in degrees (approximately 55km per degree)
    half_scale = scale / 2
    return f"POLYGON(({lon - half_scale} {lat - half_scale}, {lon + half_scale} {lat - half_scale}, {lon + half_scale} {lat + half_scale}, {lon - half_scale} {lat + half_scale}, {lon - half_scale} {lat - half_scale}))"


def seed_gis_data():
    """Populate GIS layers with districts, mandals, and villages."""
    db = SessionLocal()
    try:
        # Check if data already exists
        existing_districts = db.query(District).count()
        if existing_districts > 0:
            print(f"✓ GIS data already seeded ({existing_districts} districts found)")
            return

        print("🌍 Seeding GIS data...")

        # Create districts
        districts_map = {}
        for district_info in DISTRICTS_DATA:
            # Create a polygon geometry for district area
            polygon = create_polygon_from_point(district_info["lat"], district_info["lon"], scale=1.0)
            district_id = f"DST-{str(uuid.uuid4())[:12]}"
            district = District(
                id=district_id,
                name=district_info["name"],
                state="Andhra Pradesh",
                headquarters=district_info["headquarters"],
                geometry=polygon,
            )
            db.add(district)
            db.flush()
            districts_map[district_info["name"]] = district_id

        print(f"  ✓ Created {len(districts_map)} districts")

        # Create mandals
        mandal_count = 0
        mandals_map = {}
        for district_name, mandals_list in MANDALS_DATA.items():
            district_id = districts_map.get(district_name)
            if not district_id:
                continue

            for mandal_info in mandals_list:
                polygon = create_polygon_from_point(mandal_info["lat"], mandal_info["lon"], scale=0.3)
                mandal_id = f"MND-{str(uuid.uuid4())[:12]}"
                mandal = Mandal(
                    id=mandal_id,
                    district_id=district_id,
                    name=mandal_info["name"],
                    geometry=polygon,
                )
                db.add(mandal)
                db.flush()
                mandals_map[(district_name, mandal_info["name"])] = mandal_id
                mandal_count += 1

        print(f"  ✓ Created {mandal_count} mandals")

        # Create villages
        village_count = 0
        for (district_name, mandal_name), villages_list in VILLAGES_DATA.items():
            mandal_id = mandals_map.get((district_name, mandal_name))
            district_id = districts_map.get(district_name)
            if not mandal_id or not district_id:
                continue

            for village_info in villages_list:
                village_id = f"VLG-{str(uuid.uuid4())[:12]}"
                village = Village(
                    id=village_id,
                    mandal_id=mandal_id,
                    district_id=district_id,
                    name=village_info["name"],
                    geometry=f"POINT({village_info['lon']} {village_info['lat']})",
                )
                db.add(village)
                village_count += 1

        print(f"  ✓ Created {village_count} villages")

        # Update district asset counts based on infrastructure data
        for district in db.query(District).all():
            asset_count = (
                db.query(func.count(InfrastructureAsset.id))
                .filter(InfrastructureAsset.district == district.name)
                .scalar()
                or 0
            )
            district.total_assets = asset_count

        # Update mandal asset counts
        for mandal in db.query(Mandal).all():
            asset_count = (
                db.query(func.count(InfrastructureAsset.id))
                .filter(InfrastructureAsset.mandal == mandal.name)
                .scalar()
                or 0
            )
            mandal.total_assets = asset_count

        # Update village asset counts
        for village in db.query(Village).all():
            asset_count = (
                db.query(func.count(InfrastructureAsset.id))
                .filter(InfrastructureAsset.district == village.district_id)
                .scalar()
                or 0
            )
            village.total_assets = asset_count

        db.commit()
        print("✓ GIS data seeded successfully")
        print(
            f"  Summary: {len(districts_map)} districts, {mandal_count} mandals, {village_count} villages"
        )

    except Exception as e:
        print(f"✗ Error seeding GIS data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_gis_data()
