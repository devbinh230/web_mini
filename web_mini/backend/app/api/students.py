from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.services import student_service

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/", response_model=List[StudentResponse])
async def list_students(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await student_service.get_all_students(db, skip, limit)


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: int, db: AsyncSession = Depends(get_db)):
    return await student_service.get_student_by_id(db, student_id)


@router.post("/", response_model=StudentResponse, status_code=201)
async def create_student(data: StudentCreate, db: AsyncSession = Depends(get_db)):
    return await student_service.create_student(db, data)


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(student_id: int, data: StudentUpdate, db: AsyncSession = Depends(get_db)):
    return await student_service.update_student(db, student_id, data)


@router.delete("/{student_id}")
async def delete_student(student_id: int, db: AsyncSession = Depends(get_db)):
    return await student_service.delete_student(db, student_id)
