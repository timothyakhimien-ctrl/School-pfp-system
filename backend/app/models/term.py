"""Term model – represents an academic term (e.g., Spring 2024) within a school.
Results are attached to a term.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base

class Term(Base):
    __tablename__ = "terms"
    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(50), nullable=False)
    __table_args__ = (UniqueConstraint("school_id", "name", name="uq_term_school_name"),)

    school = relationship("School", back_populates="terms")
    results = relationship("Result", back_populates="term")
