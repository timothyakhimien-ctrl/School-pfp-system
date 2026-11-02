# Updated configuration using pydantic‑settings (Pydantic 2)
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = Field(default="http://localhost:5173", env="CORS_ORIGINS")

    model_config = SettingsConfigDict(env_file=os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
                                      env_file_encoding="utf-8")

settings = Settings()

