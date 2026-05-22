"""
Recommendation Engine for suggesting products based on pest/disease
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models import Product
import random

class RecommendationEngine:
    """Generate product recommendations"""
    
    # Product knowledge base (expandable with database)
    PRODUCT_DATABASE = {
        "white fly": {
            "products": ["Actara", "Oberon", "Polo"],
            "active_ingredients": ["Thiamethoxam", "Spiromesifen", "Diafenthiuron"],
            "dosage": "0.5g per liter of water",
            "application": "Spray on both sides of leaves"
        },
        "सफेद मक्खी": {
            "products": ["Actara", "Oberon", "Polo"],
            "active_ingredients": ["Thiamethoxam", "Spiromesifen", "Diafenthiuron"],
            "dosage": "0.5g per liter of water",
            "application": "पत्तियों के दोनों तरफ स्प्रे करें"
        },
        "aphid": {
            "products": ["Confidor", "Karate", "Actara"],
            "active_ingredients": ["Imidacloprid", "Lambda-cyhalothrin", "Thiamethoxam"],
            "dosage": "0.3ml per liter of water",
            "application": "Spray on affected parts"
        },
        "माहू": {
            "products": ["Confidor", "Karate", "Actara"],
            "active_ingredients": ["Imidacloprid", "Lambda-cyhalothrin", "Thiamethoxam"],
            "dosage": "0.3ml per liter of water",
            "application": "प्रभावित भागों पर स्प्रे करें"
        },
        "blight": {
            "products": ["Ridomil Gold", "Antracol", "Mancozeb"],
            "active_ingredients": ["Metalaxyl + Mancozeb", "Propineb", "Mancozeb"],
            "dosage": "2g per liter of water",
            "application": "Preventive spray every 7-10 days"
        },
        "झुलसा रोग": {
            "products": ["Ridomil Gold", "Antracol", "Mancozeb"],
            "active_ingredients": ["Metalaxyl + Mancozeb", "Propineb", "Mancozeb"],
            "dosage": "2g per liter of water",
            "application": "हर 7-10 दिन में निवारक स्प्रे"
        },
        "caterpillar": {
            "products": ["Coragen", "Ampligo", "Belt"],
            "active_ingredients": ["Chlorantraniliprole", "Lambda + Chlorantraniliprole", "Flubendiamide"],
            "dosage": "0.3ml per liter of water",
            "application": "Spray during early infestation"
        },
        "सुंडी": {
            "products": ["Coragen", "Ampligo", "Belt"],
            "active_ingredients": ["Chlorantraniliprole", "Lambda + Chlorantraniliprole", "Flubendiamide"],
            "dosage": "0.3ml per liter of water",
            "application": "शुरुआती संक्रमण के दौरान स्प्रे करें"
        }
    }
    
    def __init__(self, db: Session = None):
        self.db = db
    
    def get_recommendations(
        self, 
        pest_disease: Optional[str],
        crop: Optional[str],
        severity: str,
        language: str = "hi"
    ) -> Dict:
        """
        Generate product recommendations
        
        Args:
            pest_disease: Identified pest or disease
            crop: Crop type
            severity: Severity level
            language: Language for response
        
        Returns:
            Recommendation with products and advice
        """
        if not pest_disease:
            return self._general_recommendation(language)
        
        # Normalize pest/disease name
        pest_lower = pest_disease.lower()
        
        # Find in knowledge base
        product_info = None
        for key in self.PRODUCT_DATABASE:
            if key.lower() in pest_lower or pest_lower in key.lower():
                product_info = self.PRODUCT_DATABASE[key]
                break
        
        if not product_info:
            return self._general_recommendation(language)
        
        # Calculate confidence based on severity match
        confidence = self._calculate_confidence(severity, product_info)
        
        # Build recommendation
        recommendation = {
            "pest_disease": pest_disease,
            "crop": crop or "फसल",
            "severity": severity,
            "products": product_info["products"],
            "primary_product": product_info["products"][0],
            "active_ingredient": product_info["active_ingredients"][0],
            "dosage": product_info["dosage"],
            "application": product_info["application"],
            "confidence": confidence,
            "additional_advice": self._get_advice(severity, language),
            "language": language
        }
        
        return recommendation
    
    def _calculate_confidence(self, severity: str, product_info: Dict) -> float:
        """Calculate recommendation confidence"""
        base_confidence = 0.85
        
        # Adjust based on severity
        if severity == "critical":
            return base_confidence
        elif severity == "high":
            return base_confidence - 0.05
        elif severity == "medium":
            return base_confidence - 0.10
        else:
            return base_confidence - 0.15
    
    def _get_advice(self, severity: str, language: str) -> List[str]:
        """Get additional advice based on severity"""
        advice = {
            "hi": {
                "critical": [
                    "तुरंत उपचार शुरू करें",
                    "प्रभावित पौधों को अलग करें",
                    "विशेषज्ञ से सलाह लें"
                ],
                "high": [
                    "जल्द उपचार करें",
                    "नियमित निगरानी रखें",
                    "स्प्रे की सही मात्रा का उपयोग करें"
                ],
                "medium": [
                    "निवारक उपाय शुरू करें",
                    "फसल की नियमित जांच करें"
                ],
                "low": [
                    "फसल की निगरानी रखें",
                    "समय पर स्प्रे करें"
                ]
            },
            "en": {
                "critical": [
                    "Start treatment immediately",
                    "Isolate affected plants",
                    "Consult expert"
                ],
                "high": [
                    "Start treatment soon",
                    "Monitor regularly",
                    "Use correct dosage"
                ],
                "medium": [
                    "Start preventive measures",
                    "Check crop regularly"
                ],
                "low": [
                    "Monitor the crop",
                    "Spray timely"
                ]
            }
        }
        
        return advice.get(language, advice["en"]).get(severity, [])
    
    def _general_recommendation(self, language: str) -> Dict:
        """General recommendation when pest not identified"""
        if language == "hi":
            return {
                "message": "कृपया अधिक विवरण दें",
                "products": [],
                "confidence": 0.0
            }
        else:
            return {
                "message": "Please provide more details",
                "products": [],
                "confidence": 0.0
            }

# Global instance
def get_recommendation_engine(db: Session = None) -> RecommendationEngine:
    return RecommendationEngine(db)
