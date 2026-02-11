from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    dob = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True)  # Male, Female, Other
    current_grade = Column(Integer, nullable=True)
    parent_id = Column(Integer, ForeignKey("parents.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    parent = relationship("Parent", back_populates="students")
    registrations = relationship("ClassRegistration", back_populates="student", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Student(id={self.id}, name={self.name})>"
