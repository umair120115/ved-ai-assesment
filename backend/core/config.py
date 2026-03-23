# backend/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "VedaAI Assessment API"
    ENVIRONMENT: str = "development" # 'development' or 'production'

    # Supabase Secrets
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: SecretStr # SecretStr prevents accidental logging of the key

    # Gemini Secrets
    GEMINI_API_KEY: SecretStr

    # Redis Secrets (We'll use this in the next step)
    REDIS_URL: str

    # Doppler will inject these, but this allows a local .env fallback if needed
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

# Instantiate the settings so they are loaded once at startup
settings = Settings()