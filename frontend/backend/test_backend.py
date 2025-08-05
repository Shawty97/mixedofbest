
"""
Simple test script to verify backend functionality
"""
import asyncio
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.database import init_db
from app.core.config import settings

async def test_backend():
    """Test basic backend functionality"""
    try:
        print("Testing AImpact Backend...")
        print(f"Database URL: {settings.DATABASE_URL}")
        print(f"Demo Mode: {settings.DEMO_MODE}")
        
        # Test database initialization
        await init_db()
        print("✓ Database initialization successful")
        
        print("✓ Backend test completed successfully!")
        return True
        
    except Exception as e:
        print(f"✗ Backend test failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_backend())
