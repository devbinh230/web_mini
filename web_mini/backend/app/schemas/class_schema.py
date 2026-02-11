from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import time


class ClassBase(BaseModel):
    name: str
    subject: str
    teacher_name: str
    day_of_week: int  # 0=Sunday, 1=Monday, ..., 6=Saturday
    time_slot_start: time
    time_slot_end: time
    max_students: int = 30


class ClassCreate(ClassBase):
    pass


class ClassUpdate(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    teacher_name: Optional[str] = None
    day_of_week: Optional[int] = None
    time_slot_start: Optional[time] = None
    time_slot_end: Optional[time] = None
    max_students: Optional[int] = None


class ClassResponse(ClassBase):
    id: int
    current_students: int = 0

    model_config = ConfigDict(from_attributes=True)
