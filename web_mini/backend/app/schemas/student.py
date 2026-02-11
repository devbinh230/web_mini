from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date


class StudentBase(BaseModel):
    name: str
    dob: Optional[date] = None
    gender: Optional[str] = None
    current_grade: Optional[int] = None
    parent_id: int


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    current_grade: Optional[int] = None
    parent_id: Optional[int] = None


class StudentResponse(StudentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class StudentWithParentResponse(StudentResponse):
    parent_name: Optional[str] = None
