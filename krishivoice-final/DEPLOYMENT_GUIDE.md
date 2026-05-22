# 🚀 KrishiVoice Deployment Guide

Complete guide to deploy KrishiVoice to production using free cloud services.

---

## 📋 Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase account created
- [ ] Railway/Render account created
- [ ] Vercel account created
- [ ] Google Cloud project setup (optional)
- [ ] Environment variables documented

---

## 1️⃣ Database Deployment (Supabase)

### Step 1: Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name: `krishivoice-db`
4. Region: Choose nearest to India (Singapore recommended)
5. Database password: Generate strong password
6. Click "Create"

### Step 2: Get Credentials
1. Go to Project Settings → API
2. Copy:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon public key: `eyJhbGc...`
   - Service role key: `eyJhbGc...` (for backend)
3. Go to Project Settings → Database
4. Copy connection string:
   ```
   postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
   ```

### Step 3: Initialize Database
Run locally first:
```bash
cd backend
python -c "from app.database import init_db; init_db()"
```

Or use Supabase SQL Editor:
- Go to SQL Editor
- Paste contents of `backend/schema.sql`
- Run query

---

## 2️⃣ Backend Deployment (Railway)

### Option A: Railway (Recommended)

**Step 1: Create Railway Account**
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub

**Step 2: Deploy Backend**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `krishivoice` repository
4. Select `backend` folder
5. Railway will auto-detect Python

**Step 3: Configure Environment**
1. Go to Variables
2. Add all variables from `.env.example`:
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
SECRET_KEY=generate-a-secure-random-key-here
CORS_ORIGINS=https://your-frontend.vercel.app
ENVIRONMENT=production
```

**Step 4: Deploy**
1. Railway will automatically deploy
2. Note your deployment URL: `https://krishivoice-production.up.railway.app`
3. Test API: `https://your-url.railway.app/docs`

### Option B: Render

**Step 1: Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

**Step 2: Create Web Service**
1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Root Directory: `backend`
4. Environment: `Python 3`
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Step 3: Environment Variables**
Same as Railway above

**Step 4: Deploy**
- Click "Create Web Service"
- Wait for deployment (3-5 minutes)
- URL: `https://krishivoice-api.onrender.com`

---

## 3️⃣ Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
1. Update API URL in `frontend/package.json`:
```json
"proxy": "https://your-backend-url.railway.app"
```

Or create `frontend/.env.production`:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import `krishivoice` repository
5. Framework Preset: Create React App
6. Root Directory: `frontend`
7. Click "Deploy"

### Step 3: Environment Variables
1. Go to Project Settings → Environment Variables
2. Add:
```
REACT_APP_API_URL=https://your-backend.railway.app
```

### Step 4: Redeploy
1. Go to Deployments
2. Click "Redeploy" to pick up environment variables
3. Your URL: `https://krishivoice.vercel.app`

---

## 4️⃣ Google Cloud Setup (Optional - for Voice)

### Step 1: Create Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project: `krishivoice`
3. Enable APIs:
   - Cloud Speech-to-Text API
   - Cloud Translation API

### Step 2: Create Service Account
1. Go to IAM & Admin → Service Accounts
2. Create Service Account
3. Role: `Speech-to-Text Client`
4. Create key (JSON)
5. Download `google-cloud-key.json`

### Step 3: Upload to Railway
1. Go to Railway project
2. Go to Variables
3. Add `GOOGLE_APPLICATION_CREDENTIALS`:
   - Click "Add Variable"
   - Name: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: Paste entire JSON file content
4. Or upload file to `/app/credentials/` directory

### Alternative: Mock Mode
- App works without Google Cloud credentials
- Uses sample transcriptions for demo
- Perfect for initial testing

---

## 5️⃣ Domain Configuration (Optional)

### Custom Domain on Vercel
1. Go to Project Settings → Domains
2. Add your domain: `krishivoice.yourdomain.com`
3. Update DNS records (provided by Vercel)
4. Wait for SSL certificate (automatic)

### Custom Domain on Railway
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS CNAME record
4. SSL automatically provisioned

---

## 6️⃣ Post-Deployment Setup

### Import Sample Data
```bash
# Connect to your production database
DATABASE_URL="your-supabase-url" python import_syngenta_data.py
```

### Test Deployment
1. **Frontend**: Visit your Vercel URL
2. **Backend API**: Visit `your-railway-url/docs`
3. **Test voice recording**: Record → Transcribe
4. **Check pest map**: Should show sample outbreaks
5. **View daily briefing**: Check priority list

### Monitor Logs
**Railway**:
- Go to project → Deployments
- Click on latest deployment
- View logs tab

**Vercel**:
- Go to project → Deployments
- Click deployment
- View "View Function Logs"

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check Railway logs
# Common issues:
# 1. Missing environment variables
# 2. Database connection string incorrect
# 3. Python version mismatch
```

### Frontend can't connect to backend
```bash
# Check CORS configuration
# In backend .env:
CORS_ORIGINS=https://your-frontend.vercel.app,https://krishivoice.vercel.app

# Verify API URL in frontend
# Should be: https://your-backend.railway.app
```

### Database connection errors
```bash
# Verify Supabase credentials
# Check IP whitelist (Supabase allows all by default)
# Test connection locally first
```

### Google Cloud authentication fails
```bash
# Make sure JSON is properly formatted
# Check service account has correct permissions
# Verify API is enabled in GCP
```

---

## 📊 Performance Optimization

### Backend
1. Enable connection pooling (already configured)
2. Add Redis cache (optional upgrade)
3. Use CDN for static files

### Frontend
1. Enable Vercel Edge Caching
2. Optimize images (already using Leaflet tiles)
3. Code splitting (React handles automatically)

### Database
1. Add indexes on frequently queried columns:
```sql
CREATE INDEX idx_pest_reports_date ON pest_reports(reported_date);
CREATE INDEX idx_field_reports_user ON field_reports(user_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
```

---

## 🎯 Production Checklist

- [ ] All environment variables configured
- [ ] Database initialized with schema
- [ ] Sample data imported
- [ ] API docs accessible
- [ ] Frontend loads successfully
- [ ] Voice recording works
- [ ] Pest map displays clusters
- [ ] Daily briefing shows priorities
- [ ] Analytics show data
- [ ] All API endpoints respond
- [ ] HTTPS enabled (automatic)
- [ ] Error monitoring setup (optional)

---

## 💰 Cost Breakdown (Free Tier)

| Service | Free Tier Limit | Sufficient For |
|---------|----------------|----------------|
| Supabase | 500MB database, 2GB bandwidth | 10,000+ records |
| Railway | 500 hours/month | 24/7 uptime |
| Vercel | 100GB bandwidth | 100K+ page views |
| Google Cloud | 60 min voice/month | ~120 recordings |

**Total Monthly Cost**: $0 (within free tiers)

---

## 🔐 Security Best Practices

1. **Rotate Secrets**
   - Change `SECRET_KEY` regularly
   - Don't commit `.env` to git
   - Use different keys for prod/dev

2. **Database Security**
   - Use Supabase Row Level Security
   - Limit service role key usage
   - Enable audit logs

3. **API Security**
   - Implement rate limiting
   - Add authentication tokens
   - Validate all inputs

4. **HTTPS Only**
   - Force HTTPS redirects
   - Set secure cookie flags
   - Use HSTS headers

---

## 📈 Scaling Strategy

### When to upgrade:
- **Database**: > 500MB data → Supabase Pro ($25/mo)
- **Backend**: > 500 hours → Railway Pro ($5/mo)
- **Frontend**: > 100GB bandwidth → Vercel Pro ($20/mo)

### Horizontal Scaling:
- Add load balancer (Railway supports)
- Deploy multiple backend instances
- Use Redis for session management

---

## 🆘 Support

**Railway Issues**:
- Discord: railway.app/discord
- Docs: docs.railway.app

**Vercel Issues**:
- Support: vercel.com/support
- Docs: vercel.com/docs

**Supabase Issues**:
- Discord: discord.supabase.com
- Docs: supabase.com/docs

---

**Deployment Complete! 🎉**

Your KrishiVoice application is now live and ready for the hackathon presentation!
