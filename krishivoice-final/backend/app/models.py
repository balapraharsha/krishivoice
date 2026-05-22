"""
Database models for KrishiVoice
Uses Supabase PostgreSQL with SQLAlchemy
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Text, Date, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from sqlalchemy import Column, String, Text

Base = declarative_base()

class User(Base):
    """Field representatives"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="field_rep")
    territory = Column(String(255))
    state = Column(String(100))
    district = Column(String(100))
    language = Column(String(10), default="hi")
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    field_reports = relationship("FieldReport", back_populates="user")
    visits = relationship("Visit", back_populates="user")

class Farmer(Base):
    """Farmer/Grower profiles"""
    __tablename__ = "farmers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    village = Column(String(255))
    tehsil = Column(String(255))
    district = Column(String(255))
    state = Column(String(255))
    pincode = Column(String(10))
    
    primary_crop = Column(Text)
    secondary_crops = Column(JSON)  # List of crops
    land_size_acres = Column(Float, default=0.0)
    
    language = Column(String(10), default="hi")
    literacy_level = Column(String(20))  # low, medium, high
    device_type = Column(String(50))  # smartphone, keypad
    
    latitude = Column(Float)
    longitude = Column(Float)
    
    whatsapp_enabled = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    field_reports = relationship("FieldReport", back_populates="farmer")
    pest_reports = relationship("PestReport", back_populates="farmer")
    visits = relationship("Visit", back_populates="farmer")
    cards_sent = relationship("VisualCard", back_populates="farmer")

class FieldReport(Base):
    """Voice recordings and transcriptions"""
    __tablename__ = "field_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("farmers.id"))
    
    # Audio data
    audio_file_path = Column(String(500))
    audio_duration = Column(Float)
    
    # Transcription
    transcription = Column(Text)
    transcription_confidence = Column(Float)
    language_detected = Column(String(10))
    
    # Extracted entities
    crop_mentioned = Column(String(100))
    pest_disease = Column(String(255))
    severity = Column(String(20))  # low, medium, high, critical
    symptoms = Column(JSON)  # List of symptoms
    
    # Recommendations
    product_recommended = Column(String(255))
    recommendation_text = Column(Text)
    recommendation_confidence = Column(Float)
    
    # Location
    latitude = Column(Float)
    longitude = Column(Float)
    location_accuracy = Column(Float)
    
    # Metadata
    visit_date = Column(Date)
    weather_conditions = Column(String(100))
    farm_size_visited = Column(Float)
    
    # Status
    status = Column(String(50), default="pending")  # pending, processed, escalated
    needs_escalation = Column(Boolean, default=False)
    escalation_reason = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="field_reports")
    farmer = relationship("Farmer", back_populates="field_reports")

class PestReport(Base):
    """Aggregated pest outbreak data"""
    __tablename__ = "pest_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("farmers.id"))
    field_report_id = Column(UUID(as_uuid=True), ForeignKey("field_reports.id"))
    
    pest_name = Column(String(255), nullable=False)
    crop_affected = Column(String(100))
    severity = Column(String(20))  # low, medium, high, critical
    
    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(255))
    state = Column(String(255))
    
    # Detection
    reported_date = Column(Date, nullable=False)
    verified = Column(Boolean, default=False)
    
    # Clustering
    cluster_id = Column(String(100))  # For outbreak detection
    cluster_size = Column(Integer, default=1)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    farmer = relationship("Farmer", back_populates="pest_reports")

class Product(Base):
    """Product catalog"""
    __tablename__ = "products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    category = Column(String(100))  # insecticide, fungicide, herbicide
    active_ingredient = Column(String(255))
    
    # Usage
    target_pests = Column(JSON)  # List of pests
    target_crops = Column(JSON)  # List of crops
    
    dosage = Column(String(255))
    application_method = Column(Text)
    safety_period = Column(Integer)  # Days before harvest
    
    # Availability
    price = Column(Float)
    in_stock = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

class Retailer(Base):
    """Retail outlets"""
    __tablename__ = "retailers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    owner_name = Column(String(255))
    phone = Column(String(20))
    
    # Location
    address = Column(Text)
    village = Column(String(255))
    district = Column(String(255))
    state = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Business
    retailer_type = Column(String(50))
    territory = Column(String(255))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    visits = relationship("Visit", back_populates="retailer")

class Visit(Base):
    """Field visits tracking"""
    __tablename__ = "visits"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("farmers.id"))
    retailer_id = Column(UUID(as_uuid=True), ForeignKey("retailers.id"))
    
    visit_type = Column(String(50))  # farmer, retailer, mixed
    visit_date = Column(Date, nullable=False)
    visit_duration = Column(Integer)  # minutes
    
    # Purpose
    purpose = Column(String(255))
    products_promoted = Column(JSON)
    
    # Outcome
    outcome = Column(String(50))  # successful, follow_up_needed, no_sale
    notes = Column(Text)
    
    # Follow-up
    follow_up_required = Column(Boolean, default=False)
    follow_up_date = Column(Date)
    follow_up_completed = Column(Boolean, default=False)
    
    # Location
    latitude = Column(Float)
    longitude = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="visits")
    farmer = relationship("Farmer", back_populates="visits")
    retailer = relationship("Retailer", back_populates="visits")

class VisualCard(Base):
    """Visual advisory cards sent to farmers"""
    __tablename__ = "visual_cards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("farmers.id"), nullable=False)
    
    card_type = Column(String(50))  # pest_advisory, product_info, weather
    title = Column(String(255))
    content = Column(Text)
    
    # Visual
    image_path = Column(String(500))
    qr_code_path = Column(String(500))
    
    # Delivery
    delivery_method = Column(String(50))  # whatsapp, sms, print
    sent_at = Column(DateTime)
    delivered = Column(Boolean, default=False)
    read = Column(Boolean, default=False)
    read_at = Column(DateTime)
    
    # Language
    language = Column(String(10), default="hi")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    farmer = relationship("Farmer", back_populates="cards_sent")

class Campaign(Base):
    """WhatsApp/Digital campaigns"""
    __tablename__ = "campaigns"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    campaign_type = Column(String(50))  # whatsapp, sms, call
    
    # Content
    message = Column(Text)
    target_audience = Column(JSON)  # Filter criteria
    
    # Metrics
    sent_count = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    read_count = Column(Integer, default=0)
    response_count = Column(Integer, default=0)
    
    # Schedule
    scheduled_at = Column(DateTime)
    sent_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    status = Column(String(50), default="draft")  # draft, scheduled, sent, completed
    
    created_at = Column(DateTime, default=datetime.utcnow)

class DailyBriefing(Base):
    """AI-generated daily priority lists for field reps"""
    __tablename__ = "daily_briefings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    briefing_date = Column(Date, nullable=False)
    
    # Priority visits
    priority_farmers = Column(JSON)  # List of farmer IDs with reasons
    priority_retailers = Column(JSON)
    
    # Recommendations
    route_suggestion = Column(JSON)  # Optimized visit sequence
    key_actions = Column(JSON)  # List of action items
    
    # Alerts
    urgent_follow_ups = Column(JSON)
    pest_alerts = Column(JSON)
    
    # Territory intelligence
    territory_insights = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
