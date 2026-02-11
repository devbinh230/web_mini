import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.models.class_model import Class
from app.models.registration import ClassRegistration
from app.schemas.class_schema import ClassCreate, ClassUpdate
from app.db.redis import redis_client, CACHE_TTL

CLASSES_CACHE_KEY = "classes:all"


async def invalidate_class_cache():
    """Invalidate the cached classes list."""
    try:
        await redis_client.delete(CLASSES_CACHE_KEY)
    except Exception:
        pass  # Redis down -> skip cache


async def get_all_classes(db: AsyncSession, skip: int = 0, limit: int = 100):
    # Try cache first
    try:
        cached = await redis_client.get(CLASSES_CACHE_KEY)
        if cached and skip == 0 and limit == 100:
            return json.loads(cached)
    except Exception:
        pass  # Redis down -> fallback to DB

    # Query from DB with student count
    result = await db.execute(
        select(
            Class,
            func.count(ClassRegistration.id).label("current_students")
        )
        .outerjoin(ClassRegistration, Class.id == ClassRegistration.class_id)
        .group_by(Class.id)
        .offset(skip)
        .limit(limit)
        .order_by(Class.id)
    )
    rows = result.all()

    classes_data = []
    for class_obj, count in rows:
        data = {
            "id": class_obj.id,
            "name": class_obj.name,
            "subject": class_obj.subject,
            "teacher_name": class_obj.teacher_name,
            "day_of_week": class_obj.day_of_week,
            "time_slot_start": class_obj.time_slot_start.isoformat(),
            "time_slot_end": class_obj.time_slot_end.isoformat(),
            "max_students": class_obj.max_students,
            "current_students": count,
        }
        classes_data.append(data)

    # Cache the result
    try:
        if skip == 0 and limit == 100:
            await redis_client.setex(CLASSES_CACHE_KEY, CACHE_TTL, json.dumps(classes_data))
    except Exception:
        pass

    return classes_data


async def get_class_by_id(db: AsyncSession, class_id: int):
    result = await db.execute(select(Class).where(Class.id == class_id))
    class_obj = result.scalar_one_or_none()
    if not class_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    return class_obj


async def create_class(db: AsyncSession, data: ClassCreate):
    if data.time_slot_start >= data.time_slot_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time must be before end time"
        )

    class_obj = Class(**data.model_dump())
    db.add(class_obj)
    await db.flush()
    await db.refresh(class_obj)
    await invalidate_class_cache()
    return class_obj


async def update_class(db: AsyncSession, class_id: int, data: ClassUpdate):
    class_obj = await get_class_by_id(db, class_id)
    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(class_obj, key, value)

    # Validate times after update
    if class_obj.time_slot_start >= class_obj.time_slot_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time must be before end time"
        )

    await db.flush()
    await db.refresh(class_obj)
    await invalidate_class_cache()
    return class_obj


async def delete_class(db: AsyncSession, class_id: int):
    class_obj = await get_class_by_id(db, class_id)
    await db.delete(class_obj)
    await db.flush()
    await invalidate_class_cache()
    return {"message": f"Class '{class_obj.name}' deleted successfully"}
