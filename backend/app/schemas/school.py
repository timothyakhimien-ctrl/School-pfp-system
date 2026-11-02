"""School related schemas.
- SchoolCreate: name of the school.
- SchoolRead: id, name, created_at.
"""

from pydantic import BaseModel
from datetime import datetime

class SchoolCreate(BaseModel):
    name: str

class SchoolRead(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        orm_mode = True
