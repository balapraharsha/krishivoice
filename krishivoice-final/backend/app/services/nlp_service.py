"""
NLP Service for extracting entities from farmer reports
Extracts: crops, pests/diseases, severity, symptoms, location
"""
import re
from typing import Dict, List, Optional, Tuple
from app.services.voice_service import voice_service

class NLPService:
    """Extract agricultural entities from text"""
    
    # Agricultural knowledge base
    CROPS = {
        "hi": ["टमाटर", "मिर्च", "बैंगन", "गोभी", "आलू", "प्याज", "धान", "गेहूं", "मक्का", "कपास", "गन्ना"],
        "en": ["tomato", "chili", "brinjal", "cauliflower", "potato", "onion", "rice", "wheat", "corn", "cotton", "sugarcane"]
    }
    
    PESTS = {
        "hi": [
            "सफेद मक्खी", "हरा फुदका", "माहू", "थ्रिप्स", "सुंडी", 
            "फल छेदक", "तना छेदक", "पत्ती खाने वाला कीट"
        ],
        "en": [
            "white fly", "jassid", "aphid", "thrips", "caterpillar", 
            "fruit borer", "stem borer", "leaf eating insect", "bollworm"
        ]
    }
    
    DISEASES = {
        "hi": [
            "पर्ण कुंचन", "पीला रोग", "झुलसा रोग", "उकठा रोग", 
            "पत्ती धब्बा", "जड़ सड़न", "फल सड़न"
        ],
        "en": [
            "leaf curl", "yellowing disease", "blight", "wilt", 
            "leaf spot", "root rot", "fruit rot", "powdery mildew", "downy mildew"
        ]
    }
    
    SEVERITY_KEYWORDS = {
        "critical": ["गंभीर", "बहुत ज्यादा", "पूरी फसल", "severe", "critical", "entire crop", "heavy"],
        "high": ["ज्यादा", "तेजी से", "फैल रहा", "high", "spreading", "rapidly"],
        "medium": ["मध्यम", "कुछ", "थोड़ा", "moderate", "some", "little"],
        "low": ["कम", "शुरुआत", "initial", "low", "beginning"]
    }
    
    SYMPTOMS = {
        "hi": ["पीली पत्तियां", "सूख रही", "धब्बे", "मुरझाना", "झड़ना", "फल गिरना"],
        "en": ["yellowing leaves", "drying", "spots", "wilting", "dropping", "fruit drop"]
    }
    
    def extract_entities(self, text: str, language: str = "hi") -> Dict:
        """
        Extract agricultural entities from text
        
        Args:
            text: Input text (transcription)
            language: Language code
        
        Returns:
            Dictionary with extracted entities
        """
        text_lower = text.lower()
        
        # Translate to English for better processing if needed
        if language != "en":
            text_en = voice_service.translate_to_english(text, language)
        else:
            text_en = text
        
        entities = {
            "crop": self._extract_crop(text_lower, text_en, language),
            "pest_disease": self._extract_pest_disease(text_lower, text_en, language),
            "severity": self._extract_severity(text_lower, text_en),
            "symptoms": self._extract_symptoms(text_lower, text_en, language),
            "has_pest_issue": self._has_pest_issue(text_lower, text_en)
        }
        
        return entities
    
    def _extract_crop(self, text: str, text_en: str, language: str) -> Optional[str]:
        """Extract mentioned crop"""
        # Check native language
        for crop in self.CROPS.get(language, []):
            if crop.lower() in text:
                return crop
        
        # Check English translation
        for crop in self.CROPS["en"]:
            if crop in text_en.lower():
                return crop
        
        return None
    
    def _extract_pest_disease(self, text: str, text_en: str, language: str) -> Optional[str]:
        """Extract pest or disease name"""
        # Check pests
        for pest in self.PESTS.get(language, []):
            if pest.lower() in text:
                return pest
        
        for pest in self.PESTS["en"]:
            if pest in text_en.lower():
                return pest
        
        # Check diseases
        for disease in self.DISEASES.get(language, []):
            if disease.lower() in text:
                return disease
        
        for disease in self.DISEASES["en"]:
            if disease in text_en.lower():
                return disease
        
        return None
    
    def _extract_severity(self, text: str, text_en: str) -> str:
        """Determine severity level"""
        combined_text = f"{text} {text_en}".lower()
        
        for severity, keywords in self.SEVERITY_KEYWORDS.items():
            for keyword in keywords:
                if keyword.lower() in combined_text:
                    return severity
        
        return "medium"  # Default
    
    def _extract_symptoms(self, text: str, text_en: str, language: str) -> List[str]:
        """Extract symptoms"""
        symptoms = []
        
        # Check native language
        for symptom in self.SYMPTOMS.get(language, []):
            if symptom.lower() in text:
                symptoms.append(symptom)
        
        # Check English
        for symptom in self.SYMPTOMS["en"]:
            if symptom in text_en.lower():
                if symptom not in symptoms:
                    symptoms.append(symptom)
        
        return symptoms[:5]  # Max 5 symptoms
    
    def _has_pest_issue(self, text: str, text_en: str) -> bool:
        """Determine if report contains pest/disease issue"""
        pest_indicators = [
            "कीट", "रोग", "प्रकोप", "attack", "pest", "disease", 
            "infestation", "problem", "issue", "damage"
        ]
        
        combined = f"{text} {text_en}".lower()
        return any(indicator in combined for indicator in pest_indicators)

# Global instance
nlp_service = NLPService()
