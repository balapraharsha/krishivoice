# KrishiVoice — Voice Intelligence for Agriculture

> AI-powered field intelligence platform for agricultural sales representatives. Record voice observations, detect pest outbreaks, and receive AI-prioritized daily briefings — all in local Indian languages.

![KrishiVoice Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![Python](https://img.shields.io/badge/Python-3.11-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)

---

## What is KrishiVoice?

KrishiVoice is a field intelligence platform built for agricultural field representatives (FRs) working with Syngenta. It enables reps to:

- **Record voice observations** in Hindi, Telugu, Tamil, Kannada, Malayalam, and Marathi
- **Auto-transcribe and analyze** crop health, pest/disease detection, and severity scoring using Google Cloud Speech
- **Detect pest outbreak clusters** geospatially across territories
- **Receive AI-generated daily briefings** with priority visit lists and route optimization
- **Track farmer profiles** across districts with crop and land data
- **Analyze territory performance** with visit metrics, crop trends, and coverage stats

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Lucide Icons, Leaflet Maps |
| Backend | FastAPI, SQLAlchemy, Uvicorn |
| Database | Supabase (PostgreSQL) |
| AI / Speech | Google Cloud Speech-to-Text, Google Cloud Translate |
| Data | Syngenta grower/retailer/visit CSV datasets |
| Styling | Custom CSS (agricultural green theme) |

---

## Project Structure

```
krishivoice-final/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, all routes
│   │   ├── models.py                # SQLAlchemy models
│   │   ├── database.py              # Supabase/PostgreSQL connection
│   │   └── services/
│   │       ├── voice_service.py     # Google Speech + NLP
│   │       ├── analytics_service.py # Territory analytics
│   │       ├── recommendation_engine.py  # Product recommendations
│   │       ├── nlp_service.py       # Entity extraction
│   │       └── visual_card_service.py    # Card generation
│   ├── dataset/                     # Syngenta CSV datasets
│   │   ├── growers.csv
│   │   ├── retailers.csv
│   │   ├── reps_territory.csv
│   │   ├── retailer_visit_log.csv
│   │   ├── retailer_inventory_weekly.csv
│   │   ├── retailer_pos.csv
│   │   ├── digital_funnel_weekly.csv
│   │   └── whatsapp_campaign.csv
│   ├── credentials/
│   │   └── google-cloud-key.json    # GCP service account (not committed)
│   ├── import_syngenta_data.py      # Loads CSVs into database
│   ├── setup_supabase.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.js                   # Router + sidebar layout
    │   ├── App.css                  # Global theme variables
    │   └── pages/
    │       ├── Dashboard.js
    │       ├── VoiceRecording.js
    │       ├── PestOutbreakMap.js
    │       ├── DailyBriefing.js
    │       ├── FieldReports.js
    │       ├── Farmers.js
    │       └── Analytics.js
    └── package.json
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- Google Cloud project with **Speech-to-Text API** enabled

### 1. Clone the repo

```bash
git clone https://github.com/balapraharsha/krishivoice.git
cd krishivoice/krishivoice-final
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
GOOGLE_APPLICATION_CREDENTIALS=credentials/google-cloud-key.json
GCP_PROJECT_ID=your-gcp-project-id
SECRET_KEY=your-secret-key
```

Place your Google Cloud service account JSON at `backend/credentials/google-cloud-key.json`.

### 4. Import dataset

```bash
python import_syngenta_data.py
```

This loads all CSV datasets into your Supabase database (~2,750 records).

### 5. Start the backend

```bash
python -m uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 6. Frontend setup

```bash
cd ../frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

> The frontend proxies API calls to `localhost:8000` via the `"proxy"` field in `package.json`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Summary metrics |
| GET | `/api/farmers?limit=100` | Farmer profiles |
| GET | `/api/reports?limit=50` | Field reports |
| POST | `/api/voice/transcribe` | Voice → transcription + analysis |
| GET | `/api/briefing/daily/{user_id}` | AI daily briefing |
| GET | `/api/analytics/territory-coverage?days=30` | Territory analytics |
| GET | `/api/analytics/pest-outbreaks?days=14` | Pest outbreak clusters |

Full interactive docs: `http://localhost:8000/docs`

---

## Features

### Voice Recording
Record field observations in 7 Indian languages. The backend transcribes audio using Google Cloud Speech-to-Text, extracts crop/pest/severity entities via NLP, and returns product recommendations.

> **Note:** Google Cloud Translate API must be enabled in your GCP project for translation to work. Without it, voice recording still works — the original language text is used.

### Pest Outbreak Map
Interactive Leaflet map showing geospatial clustering of pest reports. Circle size indicates report count; color indicates severity (critical / high / medium / low).

### Daily Briefing
AI-generated priority visit list for the day. Includes overdue follow-ups, pest alerts in territory, and an optimized visit route with estimated time savings.

### Analytics
Territory coverage metrics, visit type breakdown, top crops by visit frequency, and top pests reported — with configurable time periods (7 days to all time).

---

## Known Issues & Fixes

**Voice transcription 500 error**
If Google Cloud Translate API is not enabled, transcription returns 500. Fix: in `voice_service.py`, wrap the translate call in a try/except and return the original text on failure.

**Dashboard showing 0s**
Ensure the proxy is configured in `frontend/package.json`:
```json
"proxy": "http://localhost:8000"
```

**Field reps showing 0**
The `reps_territory.csv` import may fail silently. Check column name mapping in `import_syngenta_data.py`.

---

## Dataset

The platform uses Syngenta-format synthetic datasets:

| File | Records | Description |
|---|---|---|
| `growers.csv` | ~1,000 | Farmer profiles with crop and land data |
| `retailers.csv` | ~200 | Retailer outlets with territory mapping |
| `retailer_visit_log.csv` | ~1,000 | Field rep visit history |
| `reps_territory.csv` | — | Field rep territory assignments |
| `retailer_inventory_weekly.csv` | — | Weekly inventory snapshots |
| `retailer_pos.csv` | — | Point-of-sale transaction data |
| `whatsapp_campaign.csv` | — | Campaign engagement data |

---

## License

MIT License — free to use, modify, and distribute.

---

## Acknowledgements

- [Syngenta](https://www.syngenta.com) — dataset structure and domain context
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text) — multilingual voice transcription
- [Supabase](https://supabase.com) — open source Firebase alternative
- [Leaflet](https://leafletjs.com) — interactive maps
- [Lucide Icons](https://lucide.dev) — icon library
