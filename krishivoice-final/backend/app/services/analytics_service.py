"""
Analytics Service for pest outbreak detection, clustering, and territory intelligence
"""
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app.models import PestReport, FieldReport, Visit, Farmer, User
import numpy as np
from collections import defaultdict
import math

class AnalyticsService:
    """Advanced analytics for pest outbreaks and field intelligence"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def detect_pest_outbreaks(self, days: int = 14, min_cluster_size: int = 3) -> List[Dict]:
        """
        Detect pest outbreak clusters using geographic proximity
        
        Args:
            days: Number of days to look back
            min_cluster_size: Minimum reports to consider an outbreak
        
        Returns:
            List of outbreak clusters
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get recent pest reports with location
        reports = self.db.query(PestReport).filter(
            and_(
                PestReport.reported_date >= cutoff_date.date(),
                PestReport.latitude.isnot(None),
                PestReport.longitude.isnot(None)
            )
        ).all()
        
        if len(reports) < min_cluster_size:
            return []
        
        # Group by pest type
        pest_groups = defaultdict(list)
        for report in reports:
            pest_groups[report.pest_name].append(report)
        
        # Detect clusters for each pest type
        clusters = []
        for pest_name, pest_reports in pest_groups.items():
            if len(pest_reports) < min_cluster_size:
                continue
            
            pest_clusters = self._cluster_reports(pest_reports, min_cluster_size)
            
            for cluster in pest_clusters:
                clusters.append({
                    "cluster_id": f"{pest_name[:3]}_{cluster['center'][0]:.2f}_{cluster['center'][1]:.2f}",
                    "pest_name": pest_name,
                    "severity": cluster["severity"],
                    "report_count": cluster["size"],
                    "center_lat": cluster["center"][0],
                    "center_lng": cluster["center"][1],
                    "radius_km": cluster["radius"],
                    "district": cluster["district"],
                    "state": cluster["state"],
                    "first_reported": cluster["first_date"],
                    "latest_reported": cluster["latest_date"],
                    "reports": cluster["reports"]
                })
        
        return clusters
    
    def _cluster_reports(self, reports: List, min_size: int) -> List[Dict]:
        """Cluster reports using distance-based grouping"""
        if len(reports) < min_size:
            return []
        
        # Simple distance-based clustering (10km threshold)
        CLUSTER_THRESHOLD_KM = 10.0
        
        clusters = []
        used = set()
        
        for i, report in enumerate(reports):
            if i in used:
                continue
            
            # Start new cluster
            cluster_reports = [report]
            used.add(i)
            
            # Find nearby reports
            for j, other_report in enumerate(reports):
                if j in used:
                    continue
                
                distance = self._haversine_distance(
                    report.latitude, report.longitude,
                    other_report.latitude, other_report.longitude
                )
                
                if distance <= CLUSTER_THRESHOLD_KM:
                    cluster_reports.append(other_report)
                    used.add(j)
            
            # Only keep if meets minimum size
            if len(cluster_reports) >= min_size:
                clusters.append(self._build_cluster_info(cluster_reports))
        
        return clusters
    
    def _build_cluster_info(self, reports: List) -> Dict:
        """Build cluster information"""
        # Calculate center (average position)
        lats = [r.latitude for r in reports]
        lngs = [r.longitude for r in reports]
        center_lat = sum(lats) / len(lats)
        center_lng = sum(lngs) / len(lngs)
        
        # Calculate radius (max distance from center)
        max_radius = max(
            self._haversine_distance(center_lat, center_lng, r.latitude, r.longitude)
            for r in reports
        )
        
        # Determine overall severity
        severity_scores = {"low": 1, "medium": 2, "high": 3, "critical": 4}
        avg_severity_score = sum(severity_scores.get(r.severity, 2) for r in reports) / len(reports)
        
        if avg_severity_score >= 3.5:
            overall_severity = "critical"
        elif avg_severity_score >= 2.5:
            overall_severity = "high"
        elif avg_severity_score >= 1.5:
            overall_severity = "medium"
        else:
            overall_severity = "low"
        
        # Get dates
        dates = [r.reported_date for r in reports if r.reported_date]
        
        return {
            "center": (center_lat, center_lng),
            "radius": round(max_radius, 2),
            "size": len(reports),
            "severity": overall_severity,
            "district": reports[0].district if reports else None,
            "state": reports[0].state if reports else None,
            "first_date": min(dates) if dates else None,
            "latest_date": max(dates) if dates else None,
            "reports": [
                {
                    "id": str(r.id),
                    "latitude": r.latitude,
                    "longitude": r.longitude,
                    "severity": r.severity,
                    "date": str(r.reported_date)
                } for r in reports
            ]
        }
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points in kilometers"""
        R = 6371  # Earth's radius in km
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def generate_daily_briefing(self, user_id: str, date: datetime.date = None) -> Dict:
        """
        Generate AI-powered daily briefing for field rep
        
        Args:
            user_id: Field rep UUID
            date: Briefing date (default: today)
        
        Returns:
            Daily briefing with priorities and recommendations
        """
        if date is None:
            date = datetime.utcnow().date()
        
        # Get user
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        # Get farmers in territory needing follow-up
        urgent_visits = self.db.query(Visit).filter(
            and_(
                Visit.user_id == user_id,
                Visit.follow_up_required == True,
                Visit.follow_up_completed == False,
                Visit.follow_up_date <= date
            )
        ).order_by(Visit.follow_up_date).limit(10).all()
        
        # Get pest alerts in territory
        pest_alerts = self._get_territory_pest_alerts(user.territory, user.state)
        
        # Get visit statistics
        recent_visits = self.db.query(Visit).filter(
            and_(
                Visit.user_id == user_id,
                Visit.visit_date >= date - timedelta(days=7)
            )
        ).count()
        
        # Build priority list
        priority_farmers = []
        for visit in urgent_visits:
            days_overdue = (date - visit.follow_up_date).days
            priority_farmers.append({
                "farmer_id": str(visit.farmer_id) if visit.farmer_id else None,
                "visit_id": str(visit.id),
                "reason": f"Follow-up overdue by {days_overdue} days" if days_overdue > 0 else "Follow-up due today",
                "priority": "high" if days_overdue > 3 else "medium",
                "last_visit": str(visit.visit_date),
                "notes": visit.notes
            })
        
        # Territory insights
        territory_insights = self._generate_territory_insights(user_id, date)
        
        return {
            "user_id": str(user_id),
            "date": str(date),
            "priority_visits": priority_farmers,
            "pest_alerts": pest_alerts,
            "territory_insights": territory_insights,
            "recent_visit_count": recent_visits,
            "recommended_visits": min(10, len(priority_farmers) + 3)
        }
    
    def _get_territory_pest_alerts(self, territory: str, state: str) -> List[Dict]:
        """Get pest alerts for territory"""
        # Get recent high-severity pest reports
        cutoff_date = datetime.utcnow() - timedelta(days=7)
        
        alerts = self.db.query(PestReport).filter(
            and_(
                PestReport.state == state,
                PestReport.severity.in_(["high", "critical"]),
                PestReport.reported_date >= cutoff_date.date()
            )
        ).limit(5).all()
        
        return [
            {
                "pest_name": alert.pest_name,
                "severity": alert.severity,
                "district": alert.district,
                "date": str(alert.reported_date)
            } for alert in alerts
        ]
    
    def _generate_territory_insights(self, user_id: str, date: datetime.date) -> str:
        """Generate AI-like insights for territory"""
        # Get statistics
        week_ago = date - timedelta(days=7)
        
        visits_this_week = self.db.query(Visit).filter(
            and_(
                Visit.user_id == user_id,
                Visit.visit_date >= week_ago,
                Visit.visit_date <= date
            )
        ).count()
        
        successful_visits = self.db.query(Visit).filter(
            and_(
                Visit.user_id == user_id,
                Visit.visit_date >= week_ago,
                Visit.outcome == "successful"
            )
        ).count()
        
        success_rate = (successful_visits / visits_this_week * 100) if visits_this_week > 0 else 0
        
        insights = f"This week: {visits_this_week} visits completed with {success_rate:.1f}% success rate. "
        
        if success_rate > 70:
            insights += "Excellent performance! "
        elif success_rate > 50:
            insights += "Good progress. "
        else:
            insights += "Focus on follow-ups to improve outcomes. "
        
        return insights
    
    def get_territory_coverage_analytics(self, user_id: str = None, days: int = 30) -> Dict:
        """Get territory coverage analytics"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = self.db.query(Visit).filter(Visit.visit_date >= cutoff_date.date())
        
        if user_id:
            query = query.filter(Visit.user_id == user_id)
        
        visits = query.all()
        
        # Calculate metrics
        total_visits = len(visits)
        unique_farmers = len(set(v.farmer_id for v in visits if v.farmer_id))
        unique_retailers = len(set(v.retailer_id for v in visits if v.retailer_id))
        
        # Visit type distribution
        visit_types = defaultdict(int)
        for visit in visits:
            visit_types[visit.visit_type] += 1
        
        return {
            "period_days": days,
            "total_visits": total_visits,
            "unique_farmers_visited": unique_farmers,
            "unique_retailers_visited": unique_retailers,
            "avg_visits_per_day": round(total_visits / days, 2),
            "visit_type_distribution": dict(visit_types)
        }

# Helper function
def get_analytics_service(db: Session) -> AnalyticsService:
    return AnalyticsService(db)
