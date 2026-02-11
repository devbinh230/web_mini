from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse
from app.services import subscription_service

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


@router.get("/", response_model=List[SubscriptionResponse])
async def list_subscriptions(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await subscription_service.get_all_subscriptions(db, skip, limit)


@router.get("/{sub_id}", response_model=SubscriptionResponse)
async def get_subscription(sub_id: int, db: AsyncSession = Depends(get_db)):
    return await subscription_service.get_subscription_by_id(db, sub_id)


@router.get("/student/{student_id}", response_model=List[SubscriptionResponse])
async def get_student_subscriptions(student_id: int, db: AsyncSession = Depends(get_db)):
    return await subscription_service.get_student_subscriptions(db, student_id)


@router.post("/", response_model=SubscriptionResponse, status_code=201)
async def create_subscription(data: SubscriptionCreate, db: AsyncSession = Depends(get_db)):
    return await subscription_service.create_subscription(db, data)


@router.put("/{sub_id}", response_model=SubscriptionResponse)
async def update_subscription(sub_id: int, data: SubscriptionUpdate, db: AsyncSession = Depends(get_db)):
    return await subscription_service.update_subscription(db, sub_id, data)


@router.patch("/{sub_id}/use-session", response_model=SubscriptionResponse)
async def use_session(sub_id: int, db: AsyncSession = Depends(get_db)):
    """Deduct one session from the subscription."""
    return await subscription_service.use_session(db, sub_id)


@router.delete("/{sub_id}")
async def delete_subscription(sub_id: int, db: AsyncSession = Depends(get_db)):
    return await subscription_service.delete_subscription(db, sub_id)
