"""Term router – CRUD for academic terms within a school.
Only admin/teacher can create/update/delete; viewers can list.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.auth import get_current_user, get_current_school, require_role
from app.db.session import get_db
from app.models import Term
from app.schemas.term import TermCreate, TermRead, TermUpdate

router = APIRouter()

@router.post("/", response_model=TermRead)
def create_term(
    payload: TermCreate,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher")),
):
    if db.query(Term).filter(Term.school_id == school.id, Term.name == payload.name).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Term name already exists in this school")
    term = Term(school_id=school.id, name=payload.name)
    db.add(term)
    db.commit()
    db.refresh(term)
    return term

@router.get("/", response_model=List[TermRead])
def list_terms(
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher", "viewer")),
):
    return db.query(Term).filter(Term.school_id == school.id).all()

@router.put("/{term_id}", response_model=TermRead)
def update_term(
    term_id: int,
    payload: TermUpdate,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher")),
):
    term = db.get(Term, term_id)
    if not term or term.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    if payload.name is not None:
        if db.query(Term).filter(Term.school_id == school.id, Term.name == payload.name, Term.id != term_id).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Term name already exists")
        term.name = payload.name
    db.commit()
    db.refresh(term)
    return term

@router.delete("/{term_id}")
def delete_term(
    term_id: int,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin")),
):
    term = db.get(Term, term_id)
    if not term or term.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    db.delete(term)
    db.commit()
    return {"msg": "term deleted"}
