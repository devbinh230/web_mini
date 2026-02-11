from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class ClassRegistration(Base):
    __tablename__ = "class_registrations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Unique constraint to prevent duplicate registrations
    __table_args__ = (
        UniqueConstraint("class_id", "student_id", name="uq_class_student"),
    )

    # Relationships
    class_ = relationship("Class", back_populates="registrations")
    student = relationship("Student", back_populates="registrations")

    def __repr__(self):
        return f"<ClassRegistration(class_id={self.class_id}, student_id={self.student_id})>"
