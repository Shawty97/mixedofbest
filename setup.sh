#!/bin/bash

# Universal Agent Platform - Complete Setup Script
# Phase 1: Environment Setup

echo "🚀 Universal Agent Platform Setup - Phase 1"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    echo "   Then run this script again."
    exit 1
fi

echo "✅ Docker is running"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI is available"

# Create environment files if they don't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
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

# External APIs (Development Keys)
OPENAI_API_KEY=sk-your-openai-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-here
AZURE_OPENAI_API_KEY=your-azure-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

# Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION=agents
EOF
fi

# Start Supabase
if [ -f "supabase/config.toml" ]; then
    echo "🔧 Starting Supabase local development..."
    supabase start
    
    echo "📊 Applying database migrations..."
    supabase db reset
    
    echo "🎯 Setting up sample data..."
    supabase seed
    
    echo "✅ Supabase setup complete!"
    echo "   - API URL: http://localhost:54321"
    echo "   - Studio: http://localhost:54323"
    echo "   - Database: postgresql://postgres:postgres@localhost:54322/postgres"
else
    echo "❌ Supabase not initialized. Run 'supabase init' first."
fi

echo ""
echo "🎉 Phase 1 Complete!"
echo "   Next steps:"
echo "   1. Ensure Docker is running"
echo "   2. Run: ./setup.sh"
echo "   3. Start development server: npm run dev"