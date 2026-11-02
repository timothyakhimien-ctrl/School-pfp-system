"""Subject related schemas.
- SubjectCreate: name.
- SubjectRead: id, name, school_id.
- SubjectUpdate: optional name.
"""

from pydantic import BaseModel, Field

class SubjectBase(BaseModel):
    name: str = Field(..., max_length=100)

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: str | None = None

class SubjectRead(SubjectBase):
    id: int
    school_id: int

    class Config:
        orm_mode = True
