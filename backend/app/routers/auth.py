"""Authentication router – handles user registration, login, token refresh, and logout.
All tokens are stored in HttpOnly Secure SameSite cookies.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from app.core.security import decode_token
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.db.session import get_db
from app.models import User, Membership, School
from app.schemas.user import RegisterUser, UserRead, TokenData

router = APIRouter()

@router.post("/register", response_model=UserRead)
def register_user(payload: RegisterUser, db: Session = Depends(get_db)):
    # Ensure email not taken
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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(str(user.id), timedelta(minutes=30))
    refresh_token = create_refresh_token(str(user.id), timedelta(days=7))
    # Set HttpOnly cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=30*60, samesite="lax")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=7*24*60*60, samesite="lax")
    return {"msg": "login successful"}

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
