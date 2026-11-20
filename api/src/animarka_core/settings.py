from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ANIMARKA_", env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://animarka:animarka@localhost:5432/animarka"
    redis_url: str = "redis://localhost:6379/0"
    broker_url: str = "amqp://guest:guest@localhost:5672//"
    storage_dir: str = "./storage"
    admin_token: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
