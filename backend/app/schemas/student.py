"""Student related schemas.
- StudentCreate: data needed to create a student.
- StudentRead: representation returned from API.
- StudentUpdate: fields allowed for update.
"""

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

class StudentBase(BaseModel):
    code: str = Field(..., max_length=50)
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    date_of_birth: Optional[date] = None
    class_id: Optional[int] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    class_id: Optional[int] = None

class StudentRead(StudentBase):
    id: int
    school_id: int
    created_at: datetime

    class Config:
        orm_mode = True
