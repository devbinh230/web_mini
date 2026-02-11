from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.student import Student
from app.models.parent import Parent
from app.schemas.student import StudentCreate, StudentUpdate


async def get_all_students(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Student)
        .options(selectinload(Student.parent))
        .offset(skip)
        .limit(limit)
        .order_by(Student.id)
    )
    return result.scalars().all()


async def get_student_by_id(db: AsyncSession, student_id: int):
    result = await db.execute(
        select(Student)
        .options(selectinload(Student.parent))
        .where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


async def create_student(db: AsyncSession, data: StudentCreate):
    # Verify parent exists
    parent_result = await db.execute(select(Parent).where(Parent.id == data.parent_id))
    if not parent_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parent with id {data.parent_id} not found"
        )

    student = Student(**data.model_dump())
    db.add(student)
    await db.flush()
    await db.refresh(student)
    return student


async def update_student(db: AsyncSession, student_id: int, data: StudentUpdate):
    student = await get_student_by_id(db, student_id)
    update_data = data.model_dump(exclude_unset=True)

    if "parent_id" in update_data:
        parent_result = await db.execute(select(Parent).where(Parent.id == update_data["parent_id"]))
        if not parent_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent with id {update_data['parent_id']} not found"
            )

    for key, value in update_data.items():
        setattr(student, key, value)

    await db.flush()
    await db.refresh(student)
    return student


async def delete_student(db: AsyncSession, student_id: int):
    student = await get_student_by_id(db, student_id)
    await db.delete(student)
    await db.flush()
    return {"message": f"Student '{student.name}' deleted successfully"}
