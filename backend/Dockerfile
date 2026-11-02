# Dockerfile for the FastAPI backend (placed under backend/)
# Uses Python 3.11 slim, installs system deps for psycopg2, then runs migrations and starts uvicorn

FROM python:3.11-slim

# System packages required for psycopg2 compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000
