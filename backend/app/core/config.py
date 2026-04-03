from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "FinPilot"
    SECRET_KEY: str = "finpilot-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = "postgresql+psycopg://finpilot:finpilot123@localhost:5433/finpilot"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # SMTP for password reset emails
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@finpilot.app"

    # Broker API keys
    UPSTOX_API_KEY: str = ""
    UPSTOX_API_SECRET: str = ""
    UPSTOX_REDIRECT_URI: str = "http://localhost:3000/settings?broker_callback=upstox"

    GROWW_API_KEY: str = ""
    GROWW_API_SECRET: str = ""

    ZERODHA_API_KEY: str = ""
    ZERODHA_API_SECRET: str = ""
    ZERODHA_REDIRECT_URI: str = "http://localhost:3000/settings?broker_callback=zerodha"

    ANGELONE_API_KEY: str = ""
    ANGELONE_CLIENT_ID: str = ""
    ANGELONE_PASSWORD: str = ""
    ANGELONE_TOTP_SECRET: str = ""

    # News API
    NEWS_API_KEY: str = ""  # Alpha Vantage or Finnhub free tier key

    # LLM Provider Configuration
    LLM_PROVIDER: str = "huggingface"  # default free cloud provider
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""
    EURON: str = "false"
    EURON_API_KEY: str = ""
    EURON_URL: str = "https://api.euron.one"
    OLLAMA: str = "false"

    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
