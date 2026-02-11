from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    package_name = Column(String(255), nullable=False)
    total_sessions = Column(Integer, nullable=False)
    used_sessions = Column(Integer, nullable=False, default=0)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    student = relationship("Student", back_populates="subscriptions")

    def __repr__(self):
        return f"<Subscription(id={self.id}, student_id={self.student_id}, package={self.package_name})>"
