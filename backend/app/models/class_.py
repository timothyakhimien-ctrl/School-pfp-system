"""Class model – belongs to a School.
Student codes reference this via class_id (optional).
"""

from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base

class Class(Base):
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    __table_args__ = (UniqueConstraint("school_id", "name", name="uq_class_school_name"),)

    # Relationships
    school = relationship("School", back_populates="classes")
    students = relationship("Student", back_populates="class_")
