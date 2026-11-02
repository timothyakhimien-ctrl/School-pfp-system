"""Result model – stores a student's score for a subject in a term.
Grades are derived from the score using the required A‑F scale.
"""

from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base import Base

class Result(Base):
    __tablename__ = "results"
    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    term_id = Column(Integer, ForeignKey("terms.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    school = relationship("School", back_populates="results")
    student = relationship("Student", back_populates="results")
    subject = relationship("Subject", back_populates="results")
    term = relationship("Term", back_populates="results")
