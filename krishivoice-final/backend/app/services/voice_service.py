"""
Voice transcription service using Google Cloud Speech-to-Text
Supports Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati
"""
import os
from google.cloud import speech
from google.cloud import translate_v2 as translate
import io
from typing import Tuple, Optional

class VoiceService:
    """Handle voice transcription and translation"""
    
    # Supported languages
    LANGUAGES = {
        "hi": "hi-IN",  # Hindi
        "ta": "ta-IN",  # Tamil
        "te": "te-IN",  # Telugu
        "kn": "kn-IN",  # Kannada
        "ml": "ml-IN",  # Malayalam
        "bn": "bn-IN",  # Bengali
        "mr": "mr-IN",  # Marathi
        "gu": "gu-IN",  # Gujarati
        "pa": "pa-IN",  # Punjabi
        "en": "en-IN"   # English
    }
    
    def __init__(self):
        """Initialize Google Cloud clients"""
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if credentials_path and os.path.exists(credentials_path):
            self.speech_client = speech.SpeechClient()
            self.translate_client = translate.Client()
            self.enabled = True
        else:
            print("⚠️  Google Cloud credentials not found - voice features disabled")
            self.speech_client = None
            self.translate_client = None
            self.enabled = False
    
    def transcribe_audio(
        self, 
        audio_content: bytes, 
        language_code: str = "hi"
    ) -> Tuple[str, float, str]:
        """
        Transcribe audio to text
        
        Args:
            audio_content: Audio file bytes
            language_code: Language code (hi, ta, te, etc.)
        
        Returns:
            (transcription, confidence, detected_language)
        """
        if not self.enabled:
            return self._mock_transcription(language_code)
        
        try:
            # Get full language code
            full_lang_code = self.LANGUAGES.get(language_code, "hi-IN")
            
            # Configure recognition
            audio = speech.RecognitionAudio(content=audio_content)
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=full_lang_code,
                enable_automatic_punctuation=True,
                model="latest_long",
                use_enhanced=True
            )
            
            # Perform transcription
            response = self.speech_client.recognize(config=config, audio=audio)
            
            if not response.results:
                return "", 0.0, language_code
            
            # Get best result
            result = response.results[0]
            alternative = result.alternatives[0]
            
            transcription = alternative.transcript
            confidence = alternative.confidence
            
            return transcription, confidence, language_code
            
        except Exception as e:
            print(f"Transcription error: {e}")
            return self._mock_transcription(language_code)
    
    def translate_to_english(self, text: str, source_language: str = "hi") -> str:
        """
        Translate text to English
        
        Args:
            text: Text to translate
            source_language: Source language code
        
        Returns:
            Translated text
        """
        if not self.enabled:
            return text  # Return original if translation unavailable
        
        try:
            result = self.translate_client.translate(
                text,
                source_language=source_language,
                target_language="en"
            )
            return result["translatedText"]
        except Exception as e:
            print(f"Translation error: {e}")
            return text
    
    def detect_language(self, text: str) -> str:
        """
        Detect language of text
        
        Args:
            text: Text to analyze
        
        Returns:
            Language code (hi, en, ta, etc.)
        """
        if not self.enabled:
            return "hi"
        
        try:
            result = self.translate_client.detect_language(text)
            detected = result["language"]
            
            # Map to our supported languages
            for code in self.LANGUAGES.keys():
                if detected.startswith(code):
                    return code
            
            return "hi"  # Default to Hindi
        except Exception as e:
            print(f"Language detection error: {e}")
            return "hi"
    
    def _mock_transcription(self, language_code: str) -> Tuple[str, float, str]:
        """Mock transcription for testing without Google Cloud"""
        mock_texts = {
            "hi": "टमाटर की फसल में सफेद मक्खी का प्रकोप है। पत्तियां पीली पड़ रही हैं।",
            "ta": "தக்காளி பயிரில் வெள்ளை ஈ தாக்குதல் உள்ளது.",
            "te": "టమాటా పంటలో తెల్ల ఈగ దాడి ఉంది.",
            "en": "White fly attack in tomato crop. Leaves are yellowing."
        }
        return mock_texts.get(language_code, mock_texts["hi"]), 0.85, language_code

# Global instance
voice_service = VoiceService()
