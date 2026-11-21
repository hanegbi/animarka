from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ANIMARKA_", env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://animarka:animarka@localhost:5432/animarka"
    redis_url: str = "redis://localhost:6379/0"
    broker_url: str = "amqp://guest:guest@localhost:5672//"
    storage_dir: str = "./storage"
    admin_token: str = ""
    db_pool: bool = True
    # Public path prefix where stored files are served, for example /api/v1/files
    files_url_prefix: str = "/api/v1/files"
    # A GitHub token is optional. Without it the two catalog listings use the public rate limit.
    github_token: str = ""
    # Where the render worker's browser finds the web app, and the secret that signs render links.
    web_origin: str = "http://localhost:3000"
    render_secret: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
