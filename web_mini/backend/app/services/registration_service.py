from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.models.class_model import Class
from app.models.student import Student
from app.models.registration import ClassRegistration
from app.services.class_service import invalidate_class_cache


async def check_schedule_overlap(db: AsyncSession, student_id: int, target_class: Class):
    """
    Core Business Logic: Check if the student already has a class
    that overlaps with the target class's schedule.

    Overlap condition (same day):
        target.start < existing.end AND target.end > existing.start
    """
    # Get all classes the student is currently registered for
    result = await db.execute(
        select(Class)
        .join(ClassRegistration, Class.id == ClassRegistration.class_id)
        .where(ClassRegistration.student_id == student_id)
    )
    registered_classes = result.scalars().all()

    for existing_class in registered_classes:
        # Check same day
        if existing_class.day_of_week == target_class.day_of_week:
            # Check time overlap
            if (target_class.time_slot_start < existing_class.time_slot_end and
                    target_class.time_slot_end > existing_class.time_slot_start):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Schedule conflict! Student already registered in "
                        f"'{existing_class.name}' ({existing_class.time_slot_start.strftime('%H:%M')}"
                        f"-{existing_class.time_slot_end.strftime('%H:%M')}) "
                        f"on the same day."
                    )
                )


async def register_student_to_class(db: AsyncSession, class_id: int, student_id: int):
    """Register a student to a class with full validation."""

    # 1. Check class exists
    class_result = await db.execute(select(Class).where(Class.id == class_id))
    target_class = class_result.scalar_one_or_none()
    if not target_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    # 2. Check student exists
    student_result = await db.execute(select(Student).where(Student.id == student_id))
    student = student_result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    # 3. Check if already registered
    existing_reg = await db.execute(
        select(ClassRegistration).where(
            ClassRegistration.class_id == class_id,
            ClassRegistration.student_id == student_id
        )
    )
    if existing_reg.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is already registered for this class"
        )

    # 4. Check max students
    count_result = await db.execute(
        select(func.count(ClassRegistration.id)).where(
            ClassRegistration.class_id == class_id
        )
    )
    current_count = count_result.scalar()
    if current_count >= target_class.max_students:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Class is full ({current_count}/{target_class.max_students})"
        )

    # 5. Check schedule overlap (Core Feature)
    await check_schedule_overlap(db, student_id, target_class)

    # 6. All checks passed -> Create registration
    registration = ClassRegistration(class_id=class_id, student_id=student_id)
    db.add(registration)
    await db.flush()
    await db.refresh(registration)
    await invalidate_class_cache()

    return registration


async def unregister_student_from_class(db: AsyncSession, class_id: int, student_id: int):
    """Remove a student's registration from a class."""
    result = await db.execute(
        select(ClassRegistration).where(
            ClassRegistration.class_id == class_id,
            ClassRegistration.student_id == student_id
        )
    )
    registration = result.scalar_one_or_none()
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )

    await db.delete(registration)
    await db.flush()
    await invalidate_class_cache()
    return {"message": "Student unregistered successfully"}


async def get_class_students(db: AsyncSession, class_id: int):
    """Get all students registered in a class."""
    result = await db.execute(
        select(Student)
        .join(ClassRegistration, Student.id == ClassRegistration.student_id)
        .where(ClassRegistration.class_id == class_id)
    )
    return result.scalars().all()


async def get_student_classes(db: AsyncSession, student_id: int):
    """Get all classes a student is registered in."""
    result = await db.execute(
        select(Class)
        .join(ClassRegistration, Class.id == ClassRegistration.class_id)
        .where(ClassRegistration.student_id == student_id)
    )
    return result.scalars().all()
