"""
Seed data script - Tạo dữ liệu mẫu cho Mini LMS.
Chạy: python seed_data.py
"""
import asyncio
from datetime import date, time
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import Base
from app.models import Parent, Student, Class, ClassRegistration, Subscription


DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://user:password@localhost:5432/mini_lms"
)


async def seed():
    engine = create_async_engine(DATABASE_URL, echo=True)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        # --- Parents ---
        parents = [
            Parent(name="Nguyen Van A", phone="0901234567", email="nguyenvana@email.com"),
            Parent(name="Tran Thi B", phone="0912345678", email="tranthib@email.com"),
            Parent(name="Le Van C", phone="0923456789", email="levanc@email.com"),
            Parent(name="Pham Thi D", phone="0934567890", email="phamthid@email.com"),
            Parent(name="Hoang Van E", phone="0945678901", email="hoangvane@email.com"),
        ]
        session.add_all(parents)
        await session.flush()

        # --- Students ---
        students = [
            Student(name="Nguyen Minh Khoi", dob=date(2015, 3, 15), gender="Male", current_grade=4, parent_id=parents[0].id),
            Student(name="Nguyen Thanh Tam", dob=date(2017, 7, 20), gender="Female", current_grade=2, parent_id=parents[0].id),
            Student(name="Tran Quoc Bao", dob=date(2014, 1, 10), gender="Male", current_grade=5, parent_id=parents[1].id),
            Student(name="Le Hoang Anh", dob=date(2016, 5, 5), gender="Female", current_grade=3, parent_id=parents[2].id),
            Student(name="Pham Duc Minh", dob=date(2015, 11, 25), gender="Male", current_grade=4, parent_id=parents[3].id),
            Student(name="Hoang Gia Bao", dob=date(2016, 9, 8), gender="Male", current_grade=3, parent_id=parents[4].id),
        ]
        session.add_all(students)
        await session.flush()

        # --- Classes ---
        classes = [
            # Thu 2 (Monday = 1)
            Class(name="Toan Nang Cao 4", subject="Toan", teacher_name="Co Mai", day_of_week=1, time_slot_start=time(8, 0), time_slot_end=time(9, 30), max_students=20),
            Class(name="Tieng Viet 4", subject="Tieng Viet", teacher_name="Thay Hung", day_of_week=1, time_slot_start=time(10, 0), time_slot_end=time(11, 30), max_students=20),
            # Thu 3 (Tuesday = 2)
            Class(name="Tieng Anh Giao Tiep", subject="Tieng Anh", teacher_name="Ms. Sarah", day_of_week=2, time_slot_start=time(8, 0), time_slot_end=time(9, 30), max_students=15),
            Class(name="Khoa Hoc Tu Nhien", subject="Khoa Hoc", teacher_name="Thay Tuan", day_of_week=2, time_slot_start=time(14, 0), time_slot_end=time(15, 30), max_students=25),
            # Thu 4 (Wednesday = 3)
            Class(name="Ve My Thuat", subject="My Thuat", teacher_name="Co Lan", day_of_week=3, time_slot_start=time(8, 0), time_slot_end=time(9, 30), max_students=15),
            Class(name="Nhac Ly Co Ban", subject="Am Nhac", teacher_name="Thay Duc", day_of_week=3, time_slot_start=time(10, 0), time_slot_end=time(11, 30), max_students=20),
            # Thu 5 (Thursday = 4)
            Class(name="Toan Co Ban 3", subject="Toan", teacher_name="Co Hoa", day_of_week=4, time_slot_start=time(8, 0), time_slot_end=time(9, 30), max_students=25),
            # Thu 6 (Friday = 5)
            Class(name="The Duc The Thao", subject="The Duc", teacher_name="Thay Nam", day_of_week=5, time_slot_start=time(7, 0), time_slot_end=time(8, 30), max_students=30),
            # Thu 7 (Saturday = 6)
            Class(name="Lap Trinh Scratch", subject="Tin Hoc", teacher_name="Thay Phong", day_of_week=6, time_slot_start=time(9, 0), time_slot_end=time(10, 30), max_students=15),
            # Overlap test: same as "Toan Nang Cao 4" on Monday 8:00-9:30
            Class(name="Lop Luyen Thi", subject="Toan", teacher_name="Co Nga", day_of_week=1, time_slot_start=time(8, 30), time_slot_end=time(10, 0), max_students=10),
        ]
        session.add_all(classes)
        await session.flush()

        # --- Registrations ---
        registrations = [
            ClassRegistration(class_id=classes[0].id, student_id=students[0].id),  # Khoi -> Toan Nang Cao
            ClassRegistration(class_id=classes[2].id, student_id=students[0].id),  # Khoi -> Tieng Anh
            ClassRegistration(class_id=classes[1].id, student_id=students[1].id),  # Tam -> Tieng Viet
            ClassRegistration(class_id=classes[4].id, student_id=students[2].id),  # Bao -> Ve
            ClassRegistration(class_id=classes[6].id, student_id=students[3].id),  # Hoang Anh -> Toan 3
            ClassRegistration(class_id=classes[7].id, student_id=students[4].id),  # Duc Minh -> The Duc
            ClassRegistration(class_id=classes[8].id, student_id=students[5].id),  # Gia Bao -> Scratch
        ]
        session.add_all(registrations)
        await session.flush()

        # --- Subscriptions ---
        subscriptions = [
            Subscription(student_id=students[0].id, package_name="Goi Hoc Ky 1", total_sessions=40, used_sessions=12, start_date=date(2026, 1, 5), end_date=date(2026, 6, 30), is_active=True),
            Subscription(student_id=students[1].id, package_name="Goi Thang", total_sessions=8, used_sessions=3, start_date=date(2026, 2, 1), end_date=date(2026, 2, 28), is_active=True),
            Subscription(student_id=students[2].id, package_name="Goi Hoc Ky 1", total_sessions=40, used_sessions=40, start_date=date(2025, 9, 1), end_date=date(2026, 1, 31), is_active=False),
            Subscription(student_id=students[3].id, package_name="Goi Ca Nhan", total_sessions=20, used_sessions=5, start_date=date(2026, 1, 15), end_date=date(2026, 5, 15), is_active=True),
        ]
        session.add_all(subscriptions)

        await session.commit()

    await engine.dispose()
    print("Seed data created successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
