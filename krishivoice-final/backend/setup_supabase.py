#!/usr/bin/env python3
"""
KrishiVoice - Supabase Configuration Helper
Helps you set up your Supabase database credentials
"""

import os
import sys

def main():
    print("\n" + "="*60)
    print("  🌾 KrishiVoice - Supabase Setup Helper")
    print("="*60 + "\n")
    
    print("This script will help you configure your Supabase database.\n")
    print("📋 Before starting, make sure you have:")
    print("   1. Created a Supabase project at https://supabase.com")
    print("   2. Your Supabase project URL")
    print("   3. Your Supabase API keys (anon and service_role)")
    print("   4. Your database connection string\n")
    
    proceed = input("Ready to proceed? (yes/no): ").strip().lower()
    if proceed not in ['yes', 'y']:
        print("\n❌ Setup cancelled. Run this script when you're ready!")
        sys.exit(0)
    
    print("\n" + "-"*60)
    print("Step 1: Supabase Project URL")
    print("-"*60)
    print("Get this from: Project Settings → API → Project URL")
    print("Example: https://xxxxxxxxxxxxx.supabase.co\n")
    
    supabase_url = input("Enter your Supabase URL: ").strip()
    
    print("\n" + "-"*60)
    print("Step 2: Supabase API Keys")
    print("-"*60)
    print("Get from: Project Settings → API → Project API keys\n")
    
    anon_key = input("Enter your anon/public key: ").strip()
    service_key = input("Enter your service_role key: ").strip()
    
    print("\n" + "-"*60)
    print("Step 3: Database Connection String")
    print("-"*60)
    print("Get from: Project Settings → Database → Connection string → URI")
    print("Example: postgresql://postgres.[ref]:[password]@...pooler.supabase.com:6543/postgres\n")
    
    database_url = input("Enter your database URL: ").strip()
    
    print("\n" + "-"*60)
    print("Step 4: Security Settings")
    print("-"*60)
    
    secret_key = input("Enter a secret key (or press Enter for auto-generate): ").strip()
    if not secret_key:
        import secrets
        secret_key = secrets.token_urlsafe(32)
        print(f"✓ Generated secret key: {secret_key[:20]}...")
    
    # Create .env file
    env_content = f"""# ========================================
# SUPABASE CONFIGURATION (PRODUCTION)
# ========================================
SUPABASE_URL={supabase_url}
SUPABASE_KEY={anon_key}
SUPABASE_SERVICE_KEY={service_key}

# Database Connection String
DATABASE_URL={database_url}

# Google Cloud Speech API (Optional - for voice features)
GOOGLE_APPLICATION_CREDENTIALS=credentials/google-cloud-key.json
GCP_PROJECT_ID=your-project-id

# JWT Secret
SECRET_KEY={secret_key}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Origins (update with your frontend URL)
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app

# Environment
ENVIRONMENT=production
"""
    
    # Write to .env file
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print("\n" + "="*60)
    print("✅ Configuration saved to .env file!")
    print("="*60)
    
    print("\n📋 Next Steps:")
    print("   1. Install dependencies: pip install -r requirements.txt")
    print("   2. Initialize database: python -c 'from app.database import init_db; init_db()'")
    print("   3. Start server: uvicorn app.main:app --reload")
    print("   4. Visit: http://localhost:8000/docs\n")
    
    init_now = input("Would you like to initialize the database now? (yes/no): ").strip().lower()
    if init_now in ['yes', 'y']:
        print("\n🔄 Initializing database...")
        try:
            from app.database import init_db
            init_db()
            print("✅ Database tables created successfully!")
        except Exception as e:
            print(f"❌ Error initializing database: {e}")
            print("   Please check your connection string and try again.")
    
    print("\n🎉 Setup complete! Your Supabase database is ready to use!")
    print("📖 For more help, see: SUPABASE_SETUP.md\n")

if __name__ == "__main__":
    main()
