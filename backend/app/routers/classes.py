"""Class router – CRUD for classes within a school.
Only admin/teacher can create/update/delete; viewers can list.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.auth import get_current_user, get_current_school, require_role
from app.db.session import get_db
from app.models import Class
from app.schemas.class_ import ClassCreate, ClassRead, ClassUpdate

router = APIRouter()

@router.post("/", response_model=ClassRead)
def create_class(
    payload: ClassCreate,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher")),
):
    # Ensure unique name per school
    if db.query(Class).filter(Class.school_id == school.id, Class.name == payload.name).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Class name already exists in this school")
    cls = Class(school_id=school.id, name=payload.name)
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return cls

@router.get("/", response_model=List[ClassRead])
def list_classes(
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher", "viewer")),
):
    return db.query(Class).filter(Class.school_id == school.id).all()

@router.put("/{class_id}", response_model=ClassRead)
def update_class(
    class_id: int,
    payload: ClassUpdate,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher")),
):
    cls = db.get(Class, class_id)
    if not cls or cls.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    if payload.name is not None:
        # check uniqueness
        if db.query(Class).filter(Class.school_id == school.id, Class.name == payload.name, Class.id != class_id).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Class name already exists")
        cls.name = payload.name
    db.commit()
    db.refresh(cls)
    return cls

@router.delete("/{class_id}")
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin")),
):
    cls = db.get(Class, class_id)
    if not cls or cls.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    db.delete(cls)
    db.commit()
    return {"msg": "class deleted"}
