"""School model – represents a school (or tenant) in the multi‑school system.
Each school can have many users (through Membership), many students, classes, subjects, terms, and results.
"""

from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base import Base

class School(Base):
    __tablename__ = "schools"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships – lazy loading, back_populates for symmetry
    memberships = relationship("Membership", back_populates="school", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="school", cascade="all, delete-orphan")
    classes = relationship("Class", back_populates="school", cascade="all, delete-orphan")
    subjects = relationship("Subject", back_populates="school", cascade="all, delete-orphan")
    terms = relationship("Term", back_populates="school", cascade="all, delete-orphan")
    results = relationship("Result", back_populates="school", cascade="all, delete-orphan")
    # many‑to‑many link to users via Memberships
    users = relationship("User", secondary="memberships", back_populates="schools", viewonly=True)
