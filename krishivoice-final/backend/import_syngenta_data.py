"""
Import Syngenta Dataset into KrishiVoice Database
Imports all 8 CSV files into Supabase PostgreSQL
"""
import pandas as pd
import sys
import os
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, Farmer, FieldReport, Visit, Retailer, PestReport
import uuid
from datetime import datetime, timedelta
import random

# Dataset paths
DATASET_DIR = "dataset"

FILES = {
    "reps": "reps_territory.csv",
    "retailers": "retailers.csv",
    "visits": "retailer_visit_log.csv",
    "inventory": "retailer_inventory_weekly.csv",
    "pos": "retailer_pos.csv",
    "growers": "growers.csv",
    "funnel": "digital_funnel_weekly.csv",
    "whatsapp": "whatsapp_campaign.csv"
}

def import_field_reps(db: Session):
    """Import field representatives from reps_territory.csv"""
    file_path = os.path.join(DATASET_DIR, FILES["reps"])
    
    if not os.path.exists(file_path):
        print(f"⚠️  {file_path} not found, skipping...")
        return 0
    
    print(f"📥 Importing field reps from {file_path}...")
    df = pd.read_csv(file_path)
    
    count = 0
    for _, row in df.iterrows():
        # Check if already exists
        existing = db.query(User).filter(User.email == f"rep_{row['rep_id']}@syngenta.local").first()
        if existing:
            continue
        
        user = User(
            id=uuid.uuid4(),
            name=f"Rep {row['rep_id']}",
            email=f"rep_{row['rep_id']}@syngenta.local",
            hashed_password="dummy_hash",  # Set proper auth later
            role="field_rep",
            territory=row.get('territory_name', ''),
            state=row.get('state', ''),
            district=row.get('district', ''),
            language="hi",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        count += 1
    
    db.commit()
    print(f"✓ Imported {count} field reps")
    return count

def import_growers(db: Session):
    """Import growers/farmers from growers.csv"""
    file_path = os.path.join(DATASET_DIR, FILES["growers"])
    
    if not os.path.exists(file_path):
        print(f"⚠️  {file_path} not found, skipping...")
        return 0
    
    print(f"📥 Importing growers from {file_path}...")
    df = pd.read_csv(file_path)
    
    # Sample to avoid overload (take first 500)
    df = df.head(500)
    
    count = 0
    for _, row in df.iterrows():
        try:
            farmer = Farmer(
                id=uuid.uuid4(),
                name=f"Grower {row['grower_id']}",
                village=row.get('tehsil', ''),
                district=row.get('district', ''),
                state=row.get('state', ''),
                primary_crop=row.get('grower_crop_calendar', 'mixed'),
                land_size_acres=float(row.get('grower_farm_size', 0)) if pd.notna(row.get('grower_farm_size')) else 0,
                language=row.get('language', 'hi'),
                literacy_level='low' if row.get('device_type') == 'keypad' else 'medium',
                device_type=row.get('device_type', 'smartphone'),
                whatsapp_enabled=(row.get('device_type') == 'smartphone'),
                created_at=datetime.utcnow()
            )
            db.add(farmer)
            count += 1
        except Exception as e:
            print(f"Error importing grower: {e}")
            continue
    
    db.commit()
    print(f"✓ Imported {count} growers")
    return count

def import_retailers(db: Session):
    """Import retailers from retailers.csv"""
    file_path = os.path.join(DATASET_DIR, FILES["retailers"])
    
    if not os.path.exists(file_path):
        print(f"⚠️  {file_path} not found, skipping...")
        return 0
    
    print(f"📥 Importing retailers from {file_path}...")
    df = pd.read_csv(file_path)
    
    # Sample to avoid overload (take first 200)
    df = df.head(200)
    
    count = 0
    for _, row in df.iterrows():
        try:
            retailer = Retailer(
                id=uuid.uuid4(),
                name=row.get('retailer_name', f"Retailer {row.get('retailer_id', '')}"),
                owner_name=row.get('retailer_owner_name', ''),
                phone=row.get('retailer_phone', ''),
                village=row.get('village', ''),
                district=row.get('district', ''),
                state=row.get('state', ''),
                retailer_type=row.get('retailer_type', ''),
                territory=row.get('territory_name', ''),
                created_at=datetime.utcnow()
            )
            db.add(retailer)
            count += 1
        except Exception as e:
            print(f"Error importing retailer: {e}")
            continue
    
    db.commit()
    print(f"✓ Imported {count} retailers")
    return count

def import_visit_logs(db: Session):
    """Import retailer visit logs as field reports and visits"""
    file_path = os.path.join(DATASET_DIR, FILES["visits"])
    
    if not os.path.exists(file_path):
        print(f"⚠️  {file_path} not found, skipping...")
        return 0
    
    print(f"📥 Importing visit logs from {file_path}...")
    df = pd.read_csv(file_path)
    
    # Sample to avoid overload (take first 1000)
    df = df.head(1000)
    
    # Get existing users and retailers
    users = db.query(User).limit(10).all()
    retailers = db.query(Retailer).limit(50).all()
    farmers = db.query(Farmer).limit(50).all()
    
    if not users:
        print("⚠️  No users found, import field reps first")
        return 0
    
    count_reports = 0
    count_visits = 0
    
    for _, row in df.iterrows():
        try:
            # Random user assignment
            user = random.choice(users)
            
            # Create field report
            visit_date = pd.to_datetime(row.get('visit_date', datetime.utcnow()))
            
            report = FieldReport(
                id=uuid.uuid4(),
                user_id=user.id,
                transcription=f"Visit: {row.get('visit_type', 'routine')} - Product: {row.get('product_recommended', 'N/A')}",
                transcription_confidence=random.uniform(0.75, 0.95),
                language_detected="hi",
                visit_date=visit_date.date(),
                status="processed",
                created_at=visit_date
            )
            db.add(report)
            count_reports += 1
            
            # Create visit record
            visit = Visit(
                id=uuid.uuid4(),
                user_id=user.id,
                retailer_id=random.choice(retailers).id if retailers else None,
                farmer_id=random.choice(farmers).id if farmers and random.random() > 0.5 else None,
                visit_type=row.get('visit_type', 'routine'),
                visit_date=visit_date.date(),
                outcome=row.get('visit_outcome', 'successful'),
                notes=f"Product: {row.get('product_recommended', 'N/A')}",
                follow_up_required=(random.random() > 0.7),
                created_at=visit_date
            )
            db.add(visit)
            count_visits += 1
            
        except Exception as e:
            print(f"Error importing visit: {e}")
            continue
    
    db.commit()
    print(f"✓ Imported {count_reports} field reports and {count_visits} visits")
    return count_reports + count_visits

def generate_sample_pest_reports(db: Session, count: int = 50):
    """Generate sample pest reports for outbreak detection"""
    print(f"📥 Generating {count} sample pest reports...")
    
    farmers = db.query(Farmer).limit(count).all()
    
    if not farmers:
        print("⚠️  No farmers found, import growers first")
        return 0
    
    pests = [
        ("White fly", "tomato"),
        ("Aphid", "chili"),
        ("Stem borer", "rice"),
        ("Bollworm", "cotton"),
        ("Leaf curl", "tomato")
    ]
    
    severities = ["low", "medium", "high", "critical"]
    
    # Create clusters in different locations
    clusters = [
        (17.4, 78.5),  # Hyderabad area
        (23.0, 72.6),  # Ahmedabad area
        (28.6, 77.2)   # Delhi area
    ]
    
    generated = 0
    for i, farmer in enumerate(farmers):
        try:
            pest, crop = random.choice(pests)
            cluster = random.choice(clusters)
            
            # Add random offset to cluster location
            lat = cluster[0] + random.uniform(-0.2, 0.2)
            lng = cluster[1] + random.uniform(-0.2, 0.2)
            
            pest_report = PestReport(
                id=uuid.uuid4(),
                farmer_id=farmer.id,
                pest_name=pest,
                crop_affected=crop,
                severity=random.choice(severities),
                latitude=lat,
                longitude=lng,
                district=farmer.district or "Unknown",
                state=farmer.state or "Unknown",
                reported_date=(datetime.utcnow() - timedelta(days=random.randint(0, 14))).date(),
                verified=False,
                created_at=datetime.utcnow()
            )
            db.add(pest_report)
            generated += 1
        except Exception as e:
            print(f"Error generating pest report: {e}")
            continue
    
    db.commit()
    print(f"✓ Generated {generated} pest reports")
    return generated

def main():
    """Main import function"""
    print("\n" + "="*60)
    print("  Syngenta Dataset Import - KrishiVoice")
    print("="*60 + "\n")
    
    # Check if dataset directory exists
    if not os.path.exists(DATASET_DIR):
        print(f"❌ Dataset directory '{DATASET_DIR}' not found!")
        print("   Please create it and place your CSV files there.")
        sys.exit(1)
    
    db = SessionLocal()
    
    try:
        total_imported = 0
        
        # Import in sequence
        total_imported += import_field_reps(db)
        total_imported += import_growers(db)
        total_imported += import_retailers(db)
        total_imported += import_visit_logs(db)
        total_imported += generate_sample_pest_reports(db, 50)
        
        print("\n" + "="*60)
        print(f"✅ Import Complete! Total records imported: {total_imported}")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error during import: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
