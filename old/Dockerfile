# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies including curl for health checks
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies including requests for health checks
RUN pip install --no-cache-dir -r requirements.txt requests

# Copy application code
COPY . .

# Create logs directory with proper permissions
RUN mkdir -p logs/calls logs/transcripts logs/sessions logs/system && \
    chmod -R 755 logs/

# Create static directory if it doesn't exist
RUN mkdir -p static && chmod -R 755 static/

# Expose port 8000 for FastAPI
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Better health check using curl (now installed)
# HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
#    CMD curl -f http://localhost:8000/health || exit 1

# Default command with better error handling and longer timeouts
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--timeout-keep-alive", "65", "--log-level", "info"]