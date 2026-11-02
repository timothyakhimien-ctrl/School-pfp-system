"""Result router – CRUD for results. Grade is calculated from score using the required scale.
Only admin/teacher can create/update; viewers can read.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.auth import get_current_user, get_current_school, require_role
from app.db.session import get_db
from app.models import Result, Student, Subject, Term, Class
from app.schemas.result import ResultCreate, ResultRead, ResultUpdate

router = APIRouter()

GRADE_MAP = [
    (90, "A"),
    (80, "B"),
    (70, "C"),
    (60, "D"),
    (50, "E"),
    (0, "F"),
]

def grade_from_score(score: float) -> str:
    for threshold, grade in GRADE_MAP:
        if score >= threshold:
            return grade
    return "F"

@router.post("/", response_model=ResultRead)
def create_result(
    payload: ResultCreate,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher")),
):
    # Validate foreign keys belong to same school
    student = db.get(Student, payload.student_id)
    subject = db.get(Subject, payload.subject_id)
    term = db.get(Term, payload.term_id)
    if not all([student, subject, term]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid foreign key IDs")
    if student.school_id != school.id or subject.school_id != school.id or term.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Foreign key does not belong to this school")
    result = Result(
        school_id=school.id,
        student_id=payload.student_id,
        subject_id=payload.subject_id,
        term_id=payload.term_id,
        score=payload.score,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    result.grade = grade_from_score(result.score)
    return result

@router.get("/", response_model=List[ResultRead])
def list_results(
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher", "viewer")),
):
    results = db.query(Result).filter(Result.school_id == school.id).all()
    for r in results:
        r.grade = grade_from_score(r.score)
    return results

@router.get("/{result_id}", response_model=ResultRead)
def get_result(
    result_id: int,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher", "viewer")),
):
    result = db.get(Result, result_id)
    if not result or result.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")
    result.grade = grade_from_score(result.score)
    return result

@router.put("/{result_id}", response_model=ResultRead)
def update_result(
    result_id: int,
    payload: ResultUpdate,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher")),
):
    result = db.get(Result, result_id)
    if not result or result.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")
    if payload.score is not None:
        result.score = payload.score
    db.commit()
    db.refresh(result)
    result.grade = grade_from_score(result.score)
    return result

@router.delete("/{result_id}")
def delete_result(
    result_id: int,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin")),
):
    result = db.get(Result, result_id)
    if not result or result.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")
    db.delete(result)
    db.commit()
    return {"msg": "result deleted"}
