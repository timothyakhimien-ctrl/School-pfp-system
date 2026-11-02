"""Membership schemas – expose role and school association.
- MembershipCreate: role for a user in a specific school.
- MembershipRead: includes user_id, school_id, role.
"""

from pydantic import BaseModel
from enum import Enum

class RoleEnum(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    VIEWER = "viewer"

class MembershipCreate(BaseModel):
    user_id: int
    school_id: int
    role: RoleEnum

class MembershipRead(BaseModel):
    user_id: int
    school_id: int
    role: RoleEnum

    class Config:
        orm_mode = True
