"""Class related schemas.
- ClassCreate: name.
- ClassRead: id, name, school_id.
- ClassUpdate: optional name.
"""

from pydantic import BaseModel, Field

class ClassBase(BaseModel):
    name: str = Field(..., max_length=100)

class ClassCreate(ClassBase):
    pass

class ClassUpdate(BaseModel):
    name: str | None = None

class ClassRead(ClassBase):
    id: int
    school_id: int

    class Config:
        orm_mode = True
