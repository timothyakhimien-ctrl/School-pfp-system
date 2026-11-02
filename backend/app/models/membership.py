"""Membership model – many‑to‑many link between User and School with a per‑school role.
The combination (user_id, school_id) is the primary key.
"""

from enum import Enum

from sqlalchemy import Column, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship

from app.db.base import Base

class RoleEnum(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STAFF = "staff"

class Membership(Base):
    __tablename__ = "memberships"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), primary_key=True)
    role = Column(SAEnum(RoleEnum), nullable=False)

    # Relationships
    user = relationship("User", back_populates="memberships")
    school = relationship("School", back_populates="memberships")
