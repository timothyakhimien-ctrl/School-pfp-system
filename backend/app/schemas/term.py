"""Term related schemas.
- TermCreate: name.
- TermRead: id, name, school_id.
- TermUpdate: optional name.
"""

from pydantic import BaseModel, Field

class TermBase(BaseModel):
    name: str = Field(..., max_length=50)

class TermCreate(TermBase):
    pass

class TermUpdate(BaseModel):
    name: str | None = None

class TermRead(TermBase):
    id: int
    school_id: int

    class Config:
        orm_mode = True
