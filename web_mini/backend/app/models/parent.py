from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.database import Base


class Parent(Base):
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    email = Column(String(255), nullable=True)

    # Relationships
    students = relationship("Student", back_populates="parent", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Parent(id={self.id}, name={self.name})>"
