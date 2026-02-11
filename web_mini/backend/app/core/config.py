from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/mini_lms"
    DATABASE_URL_SYNC: str = "postgresql://user:password@localhost:5432/mini_lms"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # App
    APP_NAME: str = "Mini LMS"
    DEBUG: bool = True

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
