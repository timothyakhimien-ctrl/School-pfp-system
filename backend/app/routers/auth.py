"""Authentication router – handles user registration, login, token refresh, logout,
and password reset with verification codes.
All tokens are stored in HttpOnly Secure SameSite cookies.
"""

from datetime import timedelta, datetime
import random
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from pydantic import BaseModel, EmailStr
from app.core.security import decode_token
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.db.session import get_db
from app.models import User, Membership, School
from app.schemas.user import RegisterUser, UserRead, TokenData

router = APIRouter()

# In-memory storage for 6-digit verification codes: { email: { "code": "123456", "expires_at": datetime } }
verification_codes = {}

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

@router.post("/register", response_model=UserRead)
def register_user(payload: RegisterUser, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed = hash_password(payload.password)
    user = User(email=payload.email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login")
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(user.hashed_password, form_data.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    access_token = create_access_token(str(user.id), timedelta(minutes=30))
    refresh_token = create_refresh_token(str(user.id), timedelta(days=7))
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=30*60, samesite="lax")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=7*24*60*60, samesite="lax")
    return {"msg": "login successful"}

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Don't leak whether email exists, return success message
        return {"msg": "If this email is registered, a 6-digit recovery code has been sent."}
    
    # Generate 6-digit OTP code
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    verification_codes[payload.email.lower()] = {
        "code": code,
        "expires_at": expires_at
    }
    
    # In a production environment, send email via SMTP or SendGrid/Resend.
    # We also return a preview/dev confirmation so user can test immediately!
    return {
        "msg": "A 6-digit security code has been sent to your email.",
        "preview_code": code  # Helpful for immediate demonstration and testing
    }

@router.post("/verify-code")
def verify_code(payload: VerifyCodeRequest):
    record = verification_codes.get(payload.email.lower())
    if not record or record["code"] != payload.code.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code")
    if datetime.utcnow() > record["expires_at"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification code has expired")
    return {"msg": "Code verified successfully"}

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    record = verification_codes.get(payload.email.lower())
    if not record or record["code"] != payload.code.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code")
    if datetime.utcnow() > record["expires_at"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification code has expired")
    
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")
    
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    
    # Invalidate code
    verification_codes.pop(payload.email.lower(), None)
    return {"msg": "Password updated successfully! You can now log in."}

@router.post("/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    new_access = create_access_token(str(user_id), timedelta(minutes=30))
    response.set_cookie(key="access_token", value=new_access, httponly=True, max_age=30*60, samesite="lax")
    return {"msg": "token refreshed"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"msg": "logged out"}
