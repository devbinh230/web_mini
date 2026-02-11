from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.database import engine, Base
from app.api import parents, students, classes, subscriptions, dashboard

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: Dispose engine
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="Mini Learning Management System - Quản lý lớp học mini",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api")
app.include_router(parents.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(classes.router, prefix="/api")
app.include_router(subscriptions.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Welcome to Mini LMS API", "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
