"""
KrishiVoice - Voice Intelligence Platform for Agricultural Field Representatives
Main FastAPI application
"""
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
import uuid
import os

from app.database import get_db, init_db, supabase
from app.models import User, Farmer, FieldReport, PestReport, Visit, Product, VisualCard
from app.services.voice_service import voice_service
from app.services.nlp_service import nlp_service
from app.services.recommendation_engine import get_recommendation_engine
from app.services.analytics_service import get_analytics_service
from app.services.visual_card_service import visual_card_service

# Initialize FastAPI app
app = FastAPI(
    title="KrishiVoice API",
    description="Voice Intelligence Platform for Agricultural Field Representatives",
    version="1.0.0"
)

# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables"""
    init_db()
    print("✓ KrishiVoice API started successfully")

# Health check
@app.get("/")
async def root():
    """API health check"""
    return {
        "status": "healthy",
        "message": "KrishiVoice API is running",
        "version": "1.0.0"
    }

# ==================== VOICE TRANSCRIPTION ====================

@app.post("/api/voice/transcribe")
async def transcribe_voice(
    audio_file: UploadFile = File(...),
    language: str = Form("hi"),
    user_id: Optional[str] = Form(None),
    farmer_id: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Transcribe voice recording and extract entities
    
    Process:
    1. Transcribe audio to text
    2. Extract agricultural entities (crop, pest, severity)
    3. Generate product recommendation
    4. Save to database
    """
    try:
        # Read audio file
        audio_content = await audio_file.read()
        
        # Transcribe
        transcription, confidence, detected_lang = voice_service.transcribe_audio(
            audio_content, language
        )
        
        # Extract entities
        entities = nlp_service.extract_entities(transcription, detected_lang)
        
        # Generate recommendation
        rec_engine = get_recommendation_engine(db)
        recommendation = rec_engine.get_recommendations(
            pest_disease=entities.get("pest_disease"),
            crop=entities.get("crop"),
            severity=entities.get("severity"),
            language=detected_lang
        )
        
        # Create field report
        field_report = FieldReport(
            id=uuid.uuid4(),
            user_id=uuid.UUID(user_id) if user_id else None,
            farmer_id=uuid.UUID(farmer_id) if farmer_id else None,
            transcription=transcription,
            transcription_confidence=confidence,
            language_detected=detected_lang,
            crop_mentioned=entities.get("crop"),
            pest_disease=entities.get("pest_disease"),
            severity=entities.get("severity"),
            symptoms=entities.get("symptoms"),
            product_recommended=recommendation.get("primary_product"),
            recommendation_text=recommendation.get("application"),
            recommendation_confidence=recommendation.get("confidence", 0.0),
            latitude=latitude,
            longitude=longitude,
            visit_date=date.today(),
            status="processed",
            needs_escalation=(confidence < 0.70),  # Low confidence escalation
            escalation_reason="Low confidence transcription" if confidence < 0.70 else None,
            created_at=datetime.utcnow()
        )
        
        db.add(field_report)
        
        # Create pest report if pest issue detected
        if entities.get("has_pest_issue") and entities.get("pest_disease") and latitude and longitude:
            pest_report = PestReport(
                id=uuid.uuid4(),
                farmer_id=uuid.UUID(farmer_id) if farmer_id else None,
                field_report_id=field_report.id,
                pest_name=entities.get("pest_disease"),
                crop_affected=entities.get("crop"),
                severity=entities.get("severity"),
                latitude=latitude,
                longitude=longitude,
                reported_date=date.today(),
                verified=False
            )
            db.add(pest_report)
        
        db.commit()
        
        return {
            "success": True,
            "report_id": str(field_report.id),
            "transcription": transcription,
            "confidence": confidence,
            "language": detected_lang,
            "entities": entities,
            "recommendation": recommendation,
            "needs_escalation": field_report.needs_escalation
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

# ==================== PEST OUTBREAK ANALYTICS ====================

@app.get("/api/analytics/pest-outbreaks")
async def get_pest_outbreaks(
    days: int = 14,
    min_cluster_size: int = 3,
    db: Session = Depends(get_db)
):
    """
    Get pest outbreak clusters with geographic clustering
    
    Returns clusters of pest reports indicating potential outbreaks
    """
    try:
        analytics = get_analytics_service(db)
        outbreaks = analytics.detect_pest_outbreaks(days, min_cluster_size)
        
        return {
            "success": True,
            "outbreak_count": len(outbreaks),
            "period_days": days,
            "outbreaks": outbreaks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== DAILY BRIEFING ====================

@app.get("/api/briefing/daily/{user_id}")
async def get_daily_briefing(
    user_id: str,
    briefing_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get AI-generated daily briefing for field representative
    
    Includes:
    - Priority visits
    - Pest alerts
    - Territory insights
    - Recommended actions
    """
    try:
        # Parse date
        if briefing_date:
            target_date = datetime.strptime(briefing_date, "%Y-%m-%d").date()
        else:
            target_date = date.today()
        
        analytics = get_analytics_service(db)
        briefing = analytics.generate_daily_briefing(user_id, target_date)
        
        return {
            "success": True,
            "briefing": briefing
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== VISUAL CARD GENERATION ====================

@app.post("/api/cards/generate")
async def generate_visual_card(
    farmer_name: str = Form(...),
    crop: str = Form(...),
    pest_disease: str = Form(...),
    product: str = Form(...),
    dosage: str = Form(...),
    severity: str = Form("medium"),
    language: str = Form("hi"),
    farmer_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Generate visual advisory card for farmer
    
    Creates a farmer-friendly visual card with:
    - Product recommendation
    - Dosage instructions
    - Application method
    - QR code for tracking
    """
    try:
        # Generate card
        card_data = visual_card_service.generate_pest_advisory_card(
            farmer_name=farmer_name,
            crop=crop,
            pest_disease=pest_disease,
            product=product,
            dosage=dosage,
            severity=severity,
            language=language
        )
        
        # Save to database
        if farmer_id:
            visual_card = VisualCard(
                id=uuid.uuid4(),
                farmer_id=uuid.UUID(farmer_id),
                card_type="pest_advisory",
                title=f"{pest_disease} - {crop}",
                content=f"Product: {product}",
                image_path=card_data["image_path"],
                qr_code_path=card_data["qr_code_path"],
                delivery_method="whatsapp",
                language=language,
                created_at=datetime.utcnow()
            )
            db.add(visual_card)
            db.commit()
        
        # Convert image to base64
        image_base64 = visual_card_service.image_to_base64(card_data["image_path"])
        
        return {
            "success": True,
            "card_id": str(visual_card.id) if farmer_id else None,
            "image_base64": image_base64,
            "image_path": card_data["image_path"],
            "qr_code_path": card_data["qr_code_path"]
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cards/image/{filename}")
async def get_card_image(filename: str):
    """Serve generated card image"""
    file_path = os.path.join("generated_cards", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

# ==================== TERRITORY ANALYTICS ====================

@app.get("/api/analytics/territory-coverage")
async def get_territory_coverage(
    user_id: Optional[str] = None,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get territory coverage analytics
    
    Metrics:
    - Total visits
    - Unique farmers/retailers visited
    - Visit type distribution
    - Coverage efficiency
    """
    try:
        analytics = get_analytics_service(db)
        coverage = analytics.get_territory_coverage_analytics(user_id, days)
        
        return {
            "success": True,
            "analytics": coverage
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== FARMERS ====================

@app.get("/api/farmers")
async def get_farmers(
    limit: int = 100,
    state: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get farmers list with optional filters"""
    query = db.query(Farmer)
    
    if state:
        query = query.filter(Farmer.state == state)
    if district:
        query = query.filter(Farmer.district == district)
    
    farmers = query.limit(limit).all()
    
    return {
        "success": True,
        "count": len(farmers),
        "farmers": [
            {
                "id": str(f.id),
                "name": f.name,
                "village": f.village,
                "district": f.district,
                "state": f.state,
                "primary_crop": f.primary_crop,
                "land_size_acres": f.land_size_acres,
                "phone": f.phone
            } for f in farmers
        ]
    }

@app.post("/api/farmers")
async def create_farmer(
    name: str = Form(...),
    phone: Optional[str] = Form(None),
    village: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    primary_crop: Optional[str] = Form(None),
    land_size_acres: Optional[float] = Form(None),
    language: str = Form("hi"),
    db: Session = Depends(get_db)
):
    """Create new farmer profile"""
    try:
        farmer = Farmer(
            id=uuid.uuid4(),
            name=name,
            phone=phone,
            village=village,
            district=district,
            state=state,
            primary_crop=primary_crop,
            land_size_acres=land_size_acres,
            language=language,
            created_at=datetime.utcnow()
        )
        db.add(farmer)
        db.commit()
        
        return {
            "success": True,
            "farmer_id": str(farmer.id),
            "message": "Farmer created successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ==================== FIELD REPORTS ====================

@app.get("/api/reports")
async def get_field_reports(
    limit: int = 50,
    user_id: Optional[str] = None,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get field reports with optional filters"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(FieldReport).filter(FieldReport.created_at >= cutoff_date)
    
    if user_id:
        query = query.filter(FieldReport.user_id == uuid.UUID(user_id))
    
    reports = query.order_by(FieldReport.created_at.desc()).limit(limit).all()
    
    return {
        "success": True,
        "count": len(reports),
        "reports": [
            {
                "id": str(r.id),
                "transcription": r.transcription,
                "confidence": r.transcription_confidence,
                "crop": r.crop_mentioned,
                "pest_disease": r.pest_disease,
                "severity": r.severity,
                "product_recommended": r.product_recommended,
                "date": str(r.visit_date),
                "needs_escalation": r.needs_escalation
            } for r in reports
        ]
    }

# ==================== DASHBOARD STATISTICS ====================

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get overall dashboard statistics"""
    from datetime import timedelta
    
    # Get counts
    total_farmers = db.query(Farmer).count()
    total_reports = db.query(FieldReport).count()
    total_reps = db.query(User).filter(User.role == "field_rep").count()
    
    # Recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_reports = db.query(FieldReport).filter(
        FieldReport.created_at >= week_ago
    ).count()
    
    recent_visits = db.query(Visit).filter(
        Visit.visit_date >= week_ago.date()
    ).count()
    
    # Pest outbreak count
    pest_outbreaks = db.query(PestReport).filter(
        PestReport.severity.in_(["high", "critical"])
    ).count()
    
    return {
        "success": True,
        "stats": {
            "total_farmers": total_farmers,
            "total_reports": total_reports,
            "total_field_reps": total_reps,
            "recent_reports_7days": recent_reports,
            "recent_visits_7days": recent_visits,
            "active_pest_outbreaks": pest_outbreaks
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
