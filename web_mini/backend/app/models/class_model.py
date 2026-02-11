from sqlalchemy import Column, Integer, String, Time
from sqlalchemy.orm import relationship
from app.db.database import Base


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    teacher_name = Column(String(255), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Sunday, 1=Monday, ..., 6=Saturday
    time_slot_start = Column(Time, nullable=False)
    time_slot_end = Column(Time, nullable=False)
    max_students = Column(Integer, nullable=False, default=30)

    # Relationships
    registrations = relationship("ClassRegistration", back_populates="class_", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Class(id={self.id}, name={self.name}, subject={self.subject})>"
