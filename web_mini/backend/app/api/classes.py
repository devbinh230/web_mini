from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.schemas.class_schema import ClassCreate, ClassUpdate, ClassResponse
from app.schemas.registration import RegistrationCreate, RegistrationResponse
from app.schemas.student import StudentResponse
from app.services import class_service, registration_service

router = APIRouter(prefix="/classes", tags=["Classes"])


@router.get("/", response_model=List[ClassResponse])
async def list_classes(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await class_service.get_all_classes(db, skip, limit)


@router.get("/{class_id}", response_model=ClassResponse)
async def get_class(class_id: int, db: AsyncSession = Depends(get_db)):
    return await class_service.get_class_by_id(db, class_id)


@router.post("/", response_model=ClassResponse, status_code=201)
async def create_class(data: ClassCreate, db: AsyncSession = Depends(get_db)):
    return await class_service.create_class(db, data)


@router.put("/{class_id}", response_model=ClassResponse)
async def update_class(class_id: int, data: ClassUpdate, db: AsyncSession = Depends(get_db)):
    return await class_service.update_class(db, class_id, data)


@router.delete("/{class_id}")
async def delete_class(class_id: int, db: AsyncSession = Depends(get_db)):
    return await class_service.delete_class(db, class_id)


# --- Registration endpoints ---

@router.post("/{class_id}/register", response_model=RegistrationResponse, status_code=201)
async def register_student(
    class_id: int,
    data: RegistrationCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a student to a class. Checks for schedule conflicts."""
    return await registration_service.register_student_to_class(db, class_id, data.student_id)


@router.delete("/{class_id}/unregister/{student_id}")
async def unregister_student(
    class_id: int,
    student_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await registration_service.unregister_student_from_class(db, class_id, student_id)


@router.get("/{class_id}/students", response_model=List[StudentResponse])
async def get_class_students(class_id: int, db: AsyncSession = Depends(get_db)):
    return await registration_service.get_class_students(db, class_id)
