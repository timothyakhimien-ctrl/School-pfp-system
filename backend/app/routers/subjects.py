"""Subject router – CRUD for subjects within a school.
Only admin/teacher can create/update/delete; viewers can list.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.auth import get_current_user, get_current_school, require_role
from app.db.session import get_db
from app.models import Subject
from app.schemas.subject import SubjectCreate, SubjectRead, SubjectUpdate

router = APIRouter()

@router.post("/", response_model=SubjectRead)
def create_subject(
    payload: SubjectCreate,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher")),
):
    if db.query(Subject).filter(Subject.school_id == school.id, Subject.name == payload.name).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subject name already exists in this school")
    subj = Subject(school_id=school.id, name=payload.name)
    db.add(subj)
    db.commit()
    db.refresh(subj)
    return subj

@router.get("/", response_model=List[SubjectRead])
def list_subjects(
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher", "viewer")),
):
    return db.query(Subject).filter(Subject.school_id == school.id).all()

@router.put("/{subject_id}", response_model=SubjectRead)
def update_subject(
    subject_id: int,
    payload: SubjectUpdate,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher")),
):
    subj = db.get(Subject, subject_id)
    if not subj or subj.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    if payload.name is not None:
        if db.query(Subject).filter(Subject.school_id == school.id, Subject.name == payload.name, Subject.id != subject_id).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subject name already exists")
        subj.name = payload.name
    db.commit()
    db.refresh(subj)
    return subj

@router.delete("/{subject_id}")
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin")),
):
    subj = db.get(Subject, subject_id)
    if not subj or subj.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    db.delete(subj)
    db.commit()
    return {"msg": "subject deleted"}
