from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.parent import Parent
from app.schemas.parent import ParentCreate, ParentUpdate


async def get_all_parents(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Parent)
        .options(selectinload(Parent.students))
        .offset(skip)
        .limit(limit)
        .order_by(Parent.id)
    )
    return result.scalars().all()


async def get_parent_by_id(db: AsyncSession, parent_id: int):
    result = await db.execute(
        select(Parent)
        .options(selectinload(Parent.students))
        .where(Parent.id == parent_id)
    )
    parent = result.scalar_one_or_none()
    if not parent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent not found")
    return parent


async def create_parent(db: AsyncSession, data: ParentCreate):
    # Check phone uniqueness
    existing = await db.execute(select(Parent).where(Parent.phone == data.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Phone number '{data.phone}' already exists"
        )

    parent = Parent(**data.model_dump())
    db.add(parent)
    await db.flush()
    await db.refresh(parent)
    return parent


async def update_parent(db: AsyncSession, parent_id: int, data: ParentUpdate):
    parent = await get_parent_by_id(db, parent_id)
    update_data = data.model_dump(exclude_unset=True)

    if "phone" in update_data and update_data["phone"] != parent.phone:
        existing = await db.execute(select(Parent).where(Parent.phone == update_data["phone"]))
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Phone number '{update_data['phone']}' already exists"
            )

    for key, value in update_data.items():
        setattr(parent, key, value)

    await db.flush()
    await db.refresh(parent)
    return parent


async def delete_parent(db: AsyncSession, parent_id: int):
    parent = await get_parent_by_id(db, parent_id)
    await db.delete(parent)
    await db.flush()
    return {"message": f"Parent '{parent.name}' deleted successfully"}
