"""FastAPI entry point for the Student Performance Management SaaS.
It includes CORS middleware, registers routers, and provides a health check.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, schools, students, classes, subjects, terms, results, dashboard

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Student Performance Management",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS – allow the Vite dev server and any future origins set in env
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers – each router defines its own prefix and tags
app.include_router(auth.router, prefix="/auth", tags=["auth"])  # login, register, token refresh
app.include_router(schools.router, prefix="/schools", tags=["schools"])  # school CRUD
app.include_router(students.router, prefix="/students", tags=["students"])  # student CRUD
app.include_router(classes.router, prefix="/classes", tags=["classes"])  # class CRUD
app.include_router(subjects.router, prefix="/subjects", tags=["subjects"])  # subject CRUD
app.include_router(terms.router, prefix="/terms", tags=["terms"])  # term CRUD
app.include_router(results.router, prefix="/results", tags=["results"])  # result CRUD
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])  # stats endpoint

@app.get("/health", summary="Health check")
def health_check():
    return {"status": "ok"}
