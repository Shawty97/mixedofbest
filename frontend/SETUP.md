# 🚀 Universal Agent Platform - Complete Setup Guide

## Phase 1: Environment Setup (CRITICAL)

### Prerequisites
- **Docker Desktop** (required for Supabase)
- **Node.js** 18+ and npm
- **Python** 3.8+ (for backend)
- **Supabase CLI** (`npm install -g supabase`)

### Quick Start (5 minutes)

#### 1. Start Docker Desktop
Make sure Docker Desktop is running on your system.

#### 2. Initialize Supabase (First Time Only)
```bash
supabase init
```

#### 3. Run Complete Setup
```bash
chmod +x setup.sh
./setup.sh
```

#### 4. Start Development Server
```bash
npm run dev
```

### Manual Setup (If Automated Script Fails)

#### Environment Files

**Root .env file:**
```bash
# Frontend Environment Variables
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_API_URL=http://localhost:8000

# Backend Environment Variables
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
SECRET_KEY=your-super-secret-key-change-this-in-production-2024
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ENVIRONMENT=development
DEMO_MODE=false

# External APIs (Get your keys from respective services)
OPENAI_API_KEY=sk-your-openai-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-here
AZURE_OPENAI_API_KEY=your-azure-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

# Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION=agents
```

#### Supabase Setup Commands

```bash
# Start Supabase services
supabase start

# Reset and apply all migrations
supabase db reset

# Check status
supabase status
```

### Service URLs After Setup

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:8080 | Universal Agent Platform |
| **Supabase API** | http://localhost:54321 | Database & Auth API |
| **Supabase Studio** | http://localhost:54323 | Database Management |
| **Backend API** | http://localhost:8000 | Python FastAPI Backend |

### API Keys Setup

#### Required for Full Functionality:
1. **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **ElevenLabs API Key** - Get from [ElevenLabs](https://elevenlabs.io/api)
3. **Azure OpenAI** (Optional) - Azure portal

#### For Demo Mode:
- Use placeholder values to test UI functionality
- Voice features will show mock responses
- AI agents will use fallback responses

### Verification Steps

#### 1. Check Supabase Status
```bash
supabase status
```

#### 2. Test Database Connection
Visit: http://localhost:54323
- Login with default credentials
- Check if `universal_agents` table exists

#### 3. Test Frontend
Visit: http://localhost:8080
- Navigate to `/studio` for Universal Agent Builder
- Check console for any errors

#### 4. Test API Endpoints
```bash
curl http://localhost:54321/rest/v1/\?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### Troubleshooting

#### Docker Issues
```bash
# Check Docker status
docker info

# Restart Docker
docker restart
```

#### Supabase Issues
```bash
# Stop all services
supabase stop

# Clean restart
supabase stop --all
supabase start
```

#### Port Conflicts
If ports 54321-54323 are in use:
```bash
# Check what's using the ports
lsof -i :54321

# Use different ports in .env
VITE_SUPABASE_URL=http://localhost:54324
```

### Next Steps After Phase 1

Once Phase 1 is complete, proceed to:
1. **Phase 2**: Service Integration (API keys)
2. **Phase 3**: Feature Testing
3. **Phase 4**: Advanced Features

### Support
- Check `SETUP.md` for detailed instructions
- Run `./setup.sh` for automated setup
- Check console logs for specific errors