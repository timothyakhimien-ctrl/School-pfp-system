"""Authentication dependencies for FastAPI routes.
- get_db provides a SQLAlchemy session.
- get_current_user decodes the JWT from the HttpOnly cookie, loads the User record.
- get_current_school validates that the user has a membership for the requested school and returns the School instance.
- require_role checks the membership.role against allowed roles.
"""

from fastapi import Depends, HTTPException, status, Request
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.core.config import settings
from app.db.session import get_db
from app.models import User, Membership, School

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise JWTError("Invalid token type")
        user_id: str = payload.get("sub")
        if user_id is None:
            raise JWTError("Missing subject")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.get(User, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user

def get_current_school(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> School:
    # Expect a header X-School-Id to indicate which school the request targets
    school_id = request.headers.get("X-School-Id")
    if not school_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="X-School-Id header missing")
    membership = (
        db.query(Membership)
        .filter(Membership.user_id == current_user.id, Membership.school_id == int(school_id))
        .first()
    )
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No membership for this school")
    school = db.get(School, int(school_id))
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")
    return school

def require_role(*allowed_roles):
    def dependency(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
        school_id = request.headers.get("X-School-Id")
        if not school_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="X-School-Id header missing")
        membership = (
            db.query(Membership)
            .filter(Membership.user_id == current_user.id, Membership.school_id == int(school_id))
            .first()
        )
        if not membership or membership.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return membership
    return dependency

