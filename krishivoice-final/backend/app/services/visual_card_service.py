"""
Visual Card Generation Service
Creates farmer-friendly visual advisory cards with QR codes
"""
from PIL import Image, ImageDraw, ImageFont
import qrcode
import io
import os
from typing import Dict, Optional
from datetime import datetime
import base64

class VisualCardService:
    """Generate visual advisory cards for farmers"""
    
    def __init__(self):
        self.card_width = 800
        self.card_height = 1000
        self.output_dir = "generated_cards"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def generate_pest_advisory_card(
        self,
        farmer_name: str,
        crop: str,
        pest_disease: str,
        product: str,
        dosage: str,
        severity: str,
        language: str = "hi"
    ) -> Dict[str, str]:
        """
        Generate pest advisory card with product recommendation
        
        Returns:
            Dict with image_path and qr_code_path
        """
        # Create image
        img = Image.new('RGB', (self.card_width, self.card_height), color='white')
        draw = ImageDraw.Draw(img)
        
        # Colors based on severity
        severity_colors = {
            "critical": "#DC2626",  # Red
            "high": "#EA580C",      # Orange
            "medium": "#F59E0B",    # Amber
            "low": "#10B981"        # Green
        }
        header_color = severity_colors.get(severity, "#10B981")
        
        # Draw header
        draw.rectangle([0, 0, self.card_width, 150], fill=header_color)
        
        # Title
        title_text = "कृषि सलाह" if language == "hi" else "Farm Advisory"
        self._draw_text(draw, title_text, 400, 75, 48, 'white', center=True)
        
        # Content area
        y_position = 200
        
        # Farmer name
        self._draw_text(draw, f"किसान: {farmer_name}" if language == "hi" else f"Farmer: {farmer_name}", 
                       50, y_position, 32, 'black')
        y_position += 60
        
        # Crop
        self._draw_text(draw, f"फसल: {crop}" if language == "hi" else f"Crop: {crop}",
                       50, y_position, 28, '#374151')
        y_position += 50
        
        # Pest/Disease
        self._draw_text(draw, f"समस्या: {pest_disease}" if language == "hi" else f"Problem: {pest_disease}",
                       50, y_position, 28, '#374151')
        y_position += 50
        
        # Severity indicator
        severity_text = self._get_severity_text(severity, language)
        draw.rectangle([50, y_position, 250, y_position + 40], fill=header_color)
        self._draw_text(draw, severity_text, 150, y_position + 20, 24, 'white', center=True)
        y_position += 80
        
        # Product recommendation box
        draw.rectangle([40, y_position, self.card_width - 40, y_position + 200], 
                      outline='#10B981', width=3)
        y_position += 20
        
        self._draw_text(draw, "अनुशंसित उत्पाद" if language == "hi" else "Recommended Product",
                       60, y_position, 32, '#10B981')
        y_position += 50
        
        self._draw_text(draw, product, 60, y_position, 36, 'black', bold=True)
        y_position += 50
        
        self._draw_text(draw, f"मात्रा: {dosage}" if language == "hi" else f"Dosage: {dosage}",
                       60, y_position, 26, '#374151')
        y_position += 100
        
        # Instructions
        y_position += 30
        instructions = [
            "पत्तियों के दोनों तरफ स्प्रे करें" if language == "hi" else "Spray on both sides of leaves",
            "सुबह या शाम को स्प्रे करें" if language == "hi" else "Spray in morning or evening",
            "7-10 दिन में दोहराएं" if language == "hi" else "Repeat after 7-10 days"
        ]
        
        for instruction in instructions:
            self._draw_text(draw, f"• {instruction}", 60, y_position, 24, '#374151')
            y_position += 40
        
        # Footer
        y_position = self.card_height - 100
        footer_text = "Syngenta KrishiVoice - Digital Agriculture"
        self._draw_text(draw, footer_text, 400, y_position, 20, '#6B7280', center=True)
        
        # Save image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_filename = f"advisory_{timestamp}.png"
        image_path = os.path.join(self.output_dir, image_filename)
        img.save(image_path)
        
        # Generate QR code
        qr_code_path = self._generate_qr_code(image_path, timestamp)
        
        return {
            "image_path": image_path,
            "qr_code_path": qr_code_path,
            "image_filename": image_filename
        }
    
    def _draw_text(self, draw, text: str, x: int, y: int, size: int, color: str, 
                   center: bool = False, bold: bool = False):
        """Draw text on image"""
        try:
            # Try to use a nice font, fallback to default
            font = ImageFont.truetype("arial.ttf", size)
        except:
            font = ImageFont.load_default()
        
        if center:
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            x = x - text_width // 2
        
        draw.text((x, y), text, fill=color, font=font)
    
    def _get_severity_text(self, severity: str, language: str) -> str:
        """Get severity text in appropriate language"""
        severity_map = {
            "hi": {
                "critical": "अत्यंत गंभीर",
                "high": "गंभीर",
                "medium": "मध्यम",
                "low": "कम"
            },
            "en": {
                "critical": "Critical",
                "high": "High",
                "medium": "Medium",
                "low": "Low"
            }
        }
        return severity_map.get(language, severity_map["en"]).get(severity, severity)
    
    def _generate_qr_code(self, image_path: str, timestamp: str) -> str:
        """Generate QR code linking to the advisory"""
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr_data = f"https://krishivoice.app/advisory/{timestamp}"
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        qr_filename = f"qr_{timestamp}.png"
        qr_path = os.path.join(self.output_dir, qr_filename)
        qr_img.save(qr_path)
        
        return qr_path
    
    def image_to_base64(self, image_path: str) -> str:
        """Convert image to base64 for API response"""
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode('utf-8')

# Global instance
visual_card_service = VisualCardService()
