from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date


class SubscriptionBase(BaseModel):
    student_id: int
    package_name: str
    total_sessions: int
    start_date: date
    end_date: date


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    package_name: Optional[str] = None
    total_sessions: Optional[int] = None
    used_sessions: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class SubscriptionResponse(SubscriptionBase):
    id: int
    used_sessions: int = 0
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)
