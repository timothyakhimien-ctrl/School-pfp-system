"""User model – represents an authentication principal.
Roles are scoped per school via the Membership association, so the User model only stores global credentials.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    memberships = relationship("Membership", back_populates="user", cascade="all, delete-orphan")
    # Convenient access to schools via secondary relationship (read‑only)
    schools = relationship("School", secondary="memberships", back_populates="users", viewonly=True)
