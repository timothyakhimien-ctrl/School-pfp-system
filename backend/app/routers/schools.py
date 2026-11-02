"""School router – CRUD for schools.
Only users with ADMIN role in a school can create new schools (initial admin will be the creator).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user, require_role
from app.db.session import get_db
from app.models import School, Membership
from app.schemas.school import SchoolCreate, SchoolRead

router = APIRouter()

@router.post("/", response_model=SchoolRead)
def create_school(payload: SchoolCreate, db: Session = Depends(get_db), user: any = Depends(get_current_user)):
    # Create school and make the creator an ADMIN membership
    school = School(name=payload.name)
    db.add(school)
    db.commit()
    db.refresh(school)
    membership = Membership(user_id=user.id, school_id=school.id, role="admin")
    db.add(membership)
    db.commit()
    return school

@router.get("/", response_model=list[SchoolRead])
def list_schools(db: Session = Depends(get_db), user: any = Depends(get_current_user)):
    # Return schools where the user has any membership
    schools = (
        db.query(School)
        .join(Membership, Membership.school_id == School.id)
        .filter(Membership.user_id == user.id)
        .all()
    )
    return schools

@router.get("/{school_id}", response_model=SchoolRead)
def get_school(school_id: int, db: Session = Depends(get_db), user: any = Depends(get_current_user)):
    membership = (
        db.query(Membership)
        .filter(Membership.user_id == user.id, Membership.school_id == school_id)
        .first()
    )
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to this school")
    school = db.get(School, school_id)
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")
    return school

@router.delete("/{school_id}")
def delete_school(school_id: int, db: Session = Depends(get_db), membership: any = Depends(require_role("admin"))):
    school = db.get(School, school_id)
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")
    db.delete(school)
    db.commit()
    return {"msg": "school deleted"}
