import random
from app.database.database import SessionLocal
from app.models.infrastructure import InfrastructureAsset

# District data for Andhra Pradesh
districts = [
    "Krishna", "NTR", "Guntur", "Prakasam", "Nellore", "Chittoor", 
    "Tirupati", "Kadapa", "Anantapur", "Visakhapatnam", "Vizianagaram",
    "East Godavari", "West Godavari", "Eluru", "Hyderabad", "Rangareddy"
]

mandals = [
    "Vijayawada", "Visakhapatnam", "Hyderabad", "Rajahmundry", "Tirupati",
    "Guntur", "Nellore", "Kurnool", "Anantapur", "Warangal", "Khammam",
    "Chittoor", "Kadapa", "Nandyal", "Tenali", "Ongole"
]

asset_types = [
    "Bridge", "Road", "Dam", "Port", "Airport", "Railway", "Power Plant",
    "Building", "Water Tank", "School", "Hospital", "Barrage", "Canal"
]

materials = [
    "Concrete", "Steel", "Bituminous", "Asphalt", "Masonry", 
    "Steel and Concrete", "Mixed", "RCC"
]

owners = [
    "Government", "NHAI", "AAI", "NTPC", "Indian Railways", 
    "Private", "Municipal", "State Authority", "Central Government"
]

statuses = [
    "Operational", "Maintenance Required", "Under Repair", 
    "Under Inspection", "Closed for Repairs", "Heritage - Monitoring Required"
]

conditions = [
    "Excellent", "Good", "Fair", "Warning", "Critical"
]

db = SessionLocal()

try:
    # Check existing count
    existing_count = db.query(InfrastructureAsset).count()
    print(f"Existing assets: {existing_count}")
    
    # Generate 148572 assets (or target number)
    target_count = 148572
    assets_to_add = target_count - existing_count
    
    print(f"Generating {assets_to_add} new assets...")
    
    # Create asset batches for efficiency
    batch_size = 1000
    created = 0
    
    for i in range(assets_to_add):
        asset_type = random.choice(asset_types)
        
        # Generate unique ID
        type_prefix = asset_type[:2].upper()
        asset_num = existing_count + i + 1
        asset_id = f"{type_prefix}-{asset_num:06d}"
        
        # Skip if exists
        if db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first():
            continue
        
        asset = InfrastructureAsset(
            id=asset_id,
            name=f"{asset_type} #{asset_num}",
            asset_type=asset_type,
            location=random.choice(mandals),
            district=random.choice(districts),
            mandal=random.choice(mandals),
            latitude=round(random.uniform(12.5, 18.5), 4),
            longitude=round(random.uniform(78.0, 84.5), 4),
            built_year=random.randint(1950, 2023),
            design_life=random.choice([25, 30, 50, 75, 100]),
            condition=random.choice(conditions),
            health_score=round(random.uniform(40, 95), 1),
            risk_level=random.choice(["Low", "Medium", "High"]),
            risk_score=round(random.uniform(10, 95), 1),
            remaining_useful_life=random.randint(1, 50),
            remaining_life=random.randint(1, 80),
            owner=random.choice(owners),
            material=random.choice(materials),
            status=random.choice(statuses),
            source="Automated Generation",
            source_id=f"AUTO-{asset_num}"
        )
        
        db.add(asset)
        created += 1
        
        # Batch commit every 1000 records
        if created % batch_size == 0:
            db.commit()
            print(f"✓ Created {created} assets...")
    
    # Final commit
    if created % batch_size != 0:
        db.commit()
    
    final_count = db.query(InfrastructureAsset).count()
    print(f"\n✓ Successfully seeded infrastructure assets.")
    print(f"  Total assets in database: {final_count}")

except Exception as e:
    db.rollback()
    print(f"ERROR: {e}")

finally:
    db.close()
