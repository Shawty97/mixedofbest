
"""
Simple script to start the FastAPI server
"""
import uvicorn
import os
import sys

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

if __name__ == "__main__":
    print("Starting AImpact Backend Server...")
    print("Demo Mode: Access with demo@aimpact.com / demo123")
    print("API Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
