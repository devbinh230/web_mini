from pydantic import BaseModel, ConfigDict
from typing import Optional


class ParentBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None


class ParentCreate(ParentBase):
    pass


class ParentUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class ParentResponse(ParentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
