from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.schemas.parent import ParentCreate, ParentUpdate, ParentResponse
from app.services import parent_service

router = APIRouter(prefix="/parents", tags=["Parents"])


@router.get("/", response_model=List[ParentResponse])
async def list_parents(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await parent_service.get_all_parents(db, skip, limit)


@router.get("/{parent_id}", response_model=ParentResponse)
async def get_parent(parent_id: int, db: AsyncSession = Depends(get_db)):
    return await parent_service.get_parent_by_id(db, parent_id)


@router.post("/", response_model=ParentResponse, status_code=201)
async def create_parent(data: ParentCreate, db: AsyncSession = Depends(get_db)):
    return await parent_service.create_parent(db, data)


@router.put("/{parent_id}", response_model=ParentResponse)
async def update_parent(parent_id: int, data: ParentUpdate, db: AsyncSession = Depends(get_db)):
    return await parent_service.update_parent(db, parent_id, data)


@router.delete("/{parent_id}")
async def delete_parent(parent_id: int, db: AsyncSession = Depends(get_db)):
    return await parent_service.delete_parent(db, parent_id)
