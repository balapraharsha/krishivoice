"""
Update imported visit dates to recent dates (last 30 days)
So they show up in Analytics dashboard
"""
from app.database import SessionLocal
from app.models import Visit, FieldReport
from datetime import datetime, timedelta
import random

def update_visit_dates():
    """Update visit dates to be within last 30 days"""
    db = SessionLocal()
    
    try:
        # Get all visits
        visits = db.query(Visit).all()
        print(f"Found {len(visits)} visits to update...")
        
        # Update each visit to a random date in last 30 days
        today = datetime.utcnow().date()
        
        for i, visit in enumerate(visits):
            # Random date in last 30 days
            days_ago = random.randint(0, 29)
            new_date = today - timedelta(days=days_ago)
            visit.visit_date = new_date
            
            if (i + 1) % 100 == 0:
                print(f"Updated {i + 1}/{len(visits)} visits...")
        
        db.commit()
        print(f"✅ Successfully updated {len(visits)} visit dates to recent dates!")
        
        # Also update field reports
        reports = db.query(FieldReport).all()
        print(f"\nFound {len(reports)} field reports to update...")
        
        for i, report in enumerate(reports):
            days_ago = random.randint(0, 29)
            new_date = today - timedelta(days=days_ago)
            report.visit_date = new_date
            report.created_at = datetime.utcnow() - timedelta(days=days_ago)
            
            if (i + 1) % 100 == 0:
                print(f"Updated {i + 1}/{len(reports)} reports...")
        
        db.commit()
        print(f"✅ Successfully updated {len(reports)} field report dates!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("  Updating Visit Dates to Recent")
    print("="*60 + "\n")
    update_visit_dates()
    print("\n✅ Done! Restart backend and refresh Analytics page.\n")