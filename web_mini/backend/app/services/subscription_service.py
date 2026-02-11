from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.subscription import Subscription
from app.models.student import Student
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdate


async def get_all_subscriptions(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Subscription).offset(skip).limit(limit).order_by(Subscription.id)
    )
    return result.scalars().all()


async def get_subscription_by_id(db: AsyncSession, sub_id: int):
    result = await db.execute(select(Subscription).where(Subscription.id == sub_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    return sub


async def get_student_subscriptions(db: AsyncSession, student_id: int):
    result = await db.execute(
        select(Subscription).where(Subscription.student_id == student_id)
    )
    return result.scalars().all()


async def create_subscription(db: AsyncSession, data: SubscriptionCreate):
    # Verify student exists
    student_result = await db.execute(select(Student).where(Student.id == data.student_id))
    if not student_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {data.student_id} not found"
        )

    sub = Subscription(**data.model_dump())
    db.add(sub)
    await db.flush()
    await db.refresh(sub)
    return sub


async def update_subscription(db: AsyncSession, sub_id: int, data: SubscriptionUpdate):
    sub = await get_subscription_by_id(db, sub_id)
    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(sub, key, value)

    if sub.used_sessions > sub.total_sessions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Used sessions cannot exceed total sessions"
        )

    await db.flush()
    await db.refresh(sub)
    return sub


async def use_session(db: AsyncSession, sub_id: int):
    """Decrement one session from the subscription."""
    sub = await get_subscription_by_id(db, sub_id)

    if not sub.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subscription is not active"
        )

    if sub.used_sessions >= sub.total_sessions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No remaining sessions"
        )

    sub.used_sessions += 1

    # Auto-deactivate if all sessions used
    if sub.used_sessions >= sub.total_sessions:
        sub.is_active = False

    await db.flush()
    await db.refresh(sub)
    return sub


async def delete_subscription(db: AsyncSession, sub_id: int):
    sub = await get_subscription_by_id(db, sub_id)
    await db.delete(sub)
    await db.flush()
    return {"message": "Subscription deleted successfully"}
