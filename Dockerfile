# Dockerfile for the FastAPI backend
# Uses Python 3.11 slim, installs build tools for psycopg2, then runs migrations and starts uvicorn

FROM python:3.11-slim

# Install system dependencies needed to build psycopg2 and run PostgreSQL client
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy only requirements first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Expose the port FastAPI will run on
EXPOSE 8000

# Run Alembic migrations then start the server
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000
