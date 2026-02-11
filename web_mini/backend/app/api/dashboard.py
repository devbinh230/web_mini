from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime

from app.db.database import get_db
from app.models.student import Student
from app.models.parent import Parent
from app.models.class_model import Class
from app.models.registration import ClassRegistration
from app.models.subscription import Subscription

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Get summary statistics for the dashboard."""

    # Total students
    students_count = await db.execute(select(func.count(Student.id)))
    total_students = students_count.scalar()

    # Total parents
    parents_count = await db.execute(select(func.count(Parent.id)))
    total_parents = parents_count.scalar()

    # Total classes
    classes_count = await db.execute(select(func.count(Class.id)))
    total_classes = classes_count.scalar()

    # Total registrations
    regs_count = await db.execute(select(func.count(ClassRegistration.id)))
    total_registrations = regs_count.scalar()

    # Active subscriptions
    active_subs = await db.execute(
        select(func.count(Subscription.id)).where(Subscription.is_active == True)
    )
    total_active_subs = active_subs.scalar()

    # Today's classes (Python weekday 0=Monday -> DB convention: 0=Sunday, 1=Monday, ..., 6=Saturday)
    python_dow = datetime.now().weekday()  # 0=Monday, 6=Sunday
    # Convert: Python Mon(0)->DB Mon(1), Tue(1)->DB Tue(2), ..., Sun(6)->DB Sun(0)
    db_dow = (python_dow + 1) % 7

    today_classes = await db.execute(
        select(func.count(Class.id)).where(Class.day_of_week == db_dow)
    )
    classes_today = today_classes.scalar()

    return {
        "total_students": total_students,
        "total_parents": total_parents,
        "total_classes": total_classes,
        "total_registrations": total_registrations,
        "active_subscriptions": total_active_subs,
        "classes_today": classes_today,
    }
