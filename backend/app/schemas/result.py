"""Result related schemas.
- ResultCreate: student_id, subject_id, term_id, score.
- ResultRead: includes grade calculated from score.
- ResultUpdate: optional score.
"""

from pydantic import BaseModel, Field
from typing import Optional

class ResultBase(BaseModel):
    student_id: int
    subject_id: int
    term_id: int
    score: float = Field(..., ge=0, le=100)

class ResultCreate(ResultBase):
    pass

class ResultUpdate(BaseModel):
    score: Optional[float] = None

class ResultRead(BaseModel):
    id: int
    school_id: int
    student_id: int
    subject_id: int
    term_id: int
    score: float
    grade: str

    class Config:
        orm_mode = True
