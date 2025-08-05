
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import asyncio

from app.core.config import settings

# SQLAlchemy setup
if "sqlite" in settings.DATABASE_URL:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def init_db():
    """Initialize database and create demo data if in demo mode"""
    # Import all models here
    from app.models import user, workspace, workflow, agent, knowledge, store
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create demo data if in demo mode
    if settings.DEMO_MODE:
        await create_demo_data()


async def create_demo_data():
    """Create demo data for demonstration purposes"""
    from app.models.user import User
    from app.models.workspace import Workspace
    from app.core.security import get_password_hash
    
    db = SessionLocal()
    try:
        # Check if demo user exists
        demo_user = db.query(User).filter(User.email == "demo@aimpact.com").first()
        if not demo_user:
            # Create demo user
            demo_user = User(
                email="demo@aimpact.com",
                hashed_password=get_password_hash("demo123"),
                is_active=True,
                is_superuser=False
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            
            # Create demo workspace
            demo_workspace = Workspace(
                name="Demo Workspace",
                description="Demonstration workspace for AImpact platform",
                owner_id=demo_user.id
            )
            db.add(demo_workspace)
            db.commit()
            
        print("✓ Demo data created successfully")
    except Exception as e:
        print(f"Error creating demo data: {e}")
        db.rollback()
    finally:
        db.close()
