"""Subject model – belongs to a School.
Used to categorize results.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    __table_args__ = (UniqueConstraint("school_id", "name", name="uq_subject_school_name"),)

    school = relationship("School", back_populates="subjects")
    results = relationship("Result", back_populates="subject")
