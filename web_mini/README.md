# Mini LMS - Quản lý Lớp học Mini

Ứng dụng quản lý lớp học mini (Mini Learning Management System) xây dựng với React.js, FastAPI, PostgreSQL, Redis và Docker.

## Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | React 18 + Vite + Ant Design + TanStack Query |
| Backend   | FastAPI + SQLAlchemy (Async) + Pydantic V2     |
| Database  | PostgreSQL 15                                  |
| Cache     | Redis                                          |
| Migration | Alembic                                        |
| DevOps    | Docker + Docker Compose                        |

## Tính năng chính

- **Dashboard**: Thống kê tổng quan (học sinh, lớp học, lượt đăng ký...)
- **Quản lý Phụ huynh**: CRUD phụ huynh (tên, SĐT, email)
- **Quản lý Học sinh**: CRUD học sinh liên kết với phụ huynh
- **Quản lý Lớp học**: CRUD lớp học + xem Thời khóa biểu dạng lưới
- **Đăng ký lớp**: Đăng ký học sinh vào lớp với kiểm tra trùng lịch (Schedule Overlap Check)
- **Gói học (Subscription)**: Quản lý gói buổi học, trừ buổi tự động

## Khởi chạy nhanh

### Yêu cầu
- Docker & Docker Compose

### Chạy toàn bộ hệ thống

```bash
# Clone và chạy
docker-compose up --build

# Chờ ~1-2 phút để build xong
# Backend:  http://localhost:8000
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### Seed dữ liệu mẫu

```bash
# Chạy sau khi docker-compose up
docker-compose exec backend python seed_data.py
```

## Cấu trúc Project

```
mini-lms/
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/            # Routes (endpoints)
│   │   ├── core/           # Config (DB url, settings)
│   │   ├── db/             # Database connection & Redis
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business Logic
│   │   └── main.py         # Entry point
│   ├── alembic/            # Database migrations
│   ├── seed_data.py        # Sample data generator
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React.js Application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── services/       # API integration (Axios)
│   │   └── App.jsx         # Main layout + routing
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

| Method | Endpoint                               | Mô tả                          |
|--------|----------------------------------------|---------------------------------|
| GET    | `/api/dashboard/stats`                 | Thống kê dashboard              |
| GET    | `/api/parents/`                        | Danh sách phụ huynh             |
| POST   | `/api/parents/`                        | Tạo phụ huynh                   |
| PUT    | `/api/parents/{id}`                    | Cập nhật phụ huynh              |
| DELETE | `/api/parents/{id}`                    | Xóa phụ huynh                   |
| GET    | `/api/students/`                       | Danh sách học sinh              |
| POST   | `/api/students/`                       | Tạo học sinh                    |
| PUT    | `/api/students/{id}`                   | Cập nhật học sinh               |
| DELETE | `/api/students/{id}`                   | Xóa học sinh                    |
| GET    | `/api/classes/`                        | Danh sách lớp học (cached)      |
| POST   | `/api/classes/`                        | Tạo lớp học                     |
| PUT    | `/api/classes/{id}`                    | Cập nhật lớp học                |
| DELETE | `/api/classes/{id}`                    | Xóa lớp học                     |
| POST   | `/api/classes/{id}/register`           | **Đăng ký + check trùng lịch** |
| DELETE | `/api/classes/{id}/unregister/{sid}`   | Hủy đăng ký                     |
| GET    | `/api/classes/{id}/students`           | DS học sinh trong lớp           |
| GET    | `/api/subscriptions/`                  | Danh sách gói học               |
| POST   | `/api/subscriptions/`                  | Tạo gói học                     |
| PATCH  | `/api/subscriptions/{id}/use-session`  | Trừ 1 buổi học                  |

## Database Schema

```
parents (1) ──── (*) students (1) ──── (*) class_registrations (*) ──── (1) classes
                        │
                        └──── (*) subscriptions
```

## Logic kiểm tra trùng lịch (Core Feature)

Khi đăng ký lớp, hệ thống kiểm tra:
1. Lớp học & học sinh tồn tại
2. Chưa đăng ký trùng
3. Lớp chưa đầy (max_students)
4. **Overlap Check**: So sánh ngày + khung giờ với tất cả lớp đã đăng ký
   - Nếu cùng ngày: `target.start < existing.end AND target.end > existing.start` → HTTP 400

## Redis Caching

- Cache danh sách lớp học (`GET /api/classes/`) với TTL = 60s
- Tự động invalidate khi có thay đổi (tạo/sửa/xóa lớp, đăng ký mới)
