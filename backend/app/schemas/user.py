"""User related Pydantic schemas.
- RegisterUser: data needed to create a new user (email, password).
- UserRead: fields returned when reading a user.
- TokenData: payload contained in JWTs.
"""

from pydantic import BaseModel, EmailStr, Field

class RegisterUser(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserRead(BaseModel):
    id: int
    email: EmailStr
    is_active: bool

    class Config:
        orm_mode = True

class TokenData(BaseModel):
    sub: str
    exp: int
    type: str
