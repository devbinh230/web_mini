from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class RegistrationCreate(BaseModel):
    student_id: int


class RegistrationResponse(BaseModel):
    id: int
    class_id: int
    student_id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
