"""Student router – CRUD operations for students within a school.
All endpoints require a valid access token and the X-School-Id header.
Only members of the school can access; teachers can create/update, viewers can only read.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.auth import get_current_user, get_current_school, require_role
from app.db.session import get_db
from app.models import Student, Class
from app.schemas.student import StudentCreate, StudentRead, StudentUpdate

router = APIRouter()

@router.post("/", response_model=StudentRead)
def create_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher")),
):
    # Ensure unique code per school
    existing = (
        db.query(Student)
        .filter(Student.school_id == school.id, Student.code == payload.code)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student code already exists in this school")
    student = Student(
        school_id=school.id,
        code=payload.code,
        first_name=payload.first_name,
        last_name=payload.last_name,
        date_of_birth=payload.date_of_birth,
        class_id=payload.class_id,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@router.get("/", response_model=List[StudentRead])
def list_students(
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher", "viewer")),
):
    students = db.query(Student).filter(Student.school_id == school.id).all()
    return students

@router.get("/{student_id}", response_model=StudentRead)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher", "viewer")),
):
    student = db.get(Student, student_id)
    if not student or student.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student

@router.put("/{student_id}", response_model=StudentRead)
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin", "teacher")),
):
    student = db.get(Student, student_id)
    if not student or student.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    if payload.first_name is not None:
        student.first_name = payload.first_name
    if payload.last_name is not None:
        student.last_name = payload.last_name
    if payload.date_of_birth is not None:
        student.date_of_birth = payload.date_of_birth
    if payload.class_id is not None:
        # Verify class belongs to the same school
        cls = db.get(Class, payload.class_id)
        if not cls or cls.school_id != school.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid class for this school")
        student.class_id = payload.class_id
    db.commit()
    db.refresh(student)
    return student

@router.delete("/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    user: any = Depends(get_current_user),
    school: any = Depends(get_current_school),
    _: any = Depends(require_role("admin")),
):
    student = db.get(Student, student_id)
    if not student or student.school_id != school.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"msg": "student deleted"}
