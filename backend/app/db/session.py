from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Generator

from app.core.config import settings

# Create SQLAlchemy engine using the DATABASE_URL from settings
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator:
    """Yield a database session and ensure it is closed after use.
    Used as a FastAPI dependency.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
