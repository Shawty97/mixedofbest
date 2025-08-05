
# AImpact Platform Backend

FastAPI-based backend for the AImpact AI orchestration platform.

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Initialize database:
```bash
alembic upgrade head
```

4. Run the server:
```bash
python app/main.py
```

The API will be available at http://localhost:8000

## Demo Mode

By default, the application runs in demo mode with SQLite database and demo data.

**Demo Credentials:**
- Email: demo@aimpact.com
- Password: demo123

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description"
```

Apply migrations:
```bash
alembic upgrade head
```

### Project Structure

```
backend/
├── app/
│   ├── api/           # API routes
│   ├── core/          # Core functionality (config, database, security)
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   └── services/      # Business logic
├── alembic/           # Database migrations
└── data/              # SQLite database (demo mode)
```

## Features Implemented

### Phase 1: Backend Foundation ✓
- FastAPI setup with CORS
- SQLAlchemy database models
- JWT authentication
- User registration and login
- Demo mode with SQLite
- Basic API endpoints
- Database migrations with Alembic

### Next Steps (Phase 2):
- Workflow engine and DAG execution
- Core Platform API endpoints
- Node processors for workflow execution
- Async task management
