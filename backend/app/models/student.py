"""Student model – belongs to a School and optionally to a Class.
Student codes are unique within a school.
"""

from sqlalchemy import Column, Integer, String, Date, ForeignKey, UniqueConstraint, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base import Base

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)
    code = Column(String(50), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("school_id", "code", name="uq_student_school_code"),)

    # Relationships
    school = relationship("School", back_populates="students")
    class_ = relationship("Class", back_populates="students")
    results = relationship("Result", back_populates="student", cascade="all, delete-orphan")
