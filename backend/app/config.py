import os
from dataclasses import dataclass
from dotenv import load_dotenv


load_dotenv(override=True)


@dataclass
class Settings:
    api_key: str | None
    base_url: str = "https://api.deepseek.com/v1"
    model: str = "deepseek-chat"
    frontend_origin: str = "http://localhost:3000"


def load_settings() -> Settings:
    return Settings(
        api_key=os.getenv("DEEPSEEK_API_KEY"),
        base_url=os.getenv("BASE_URL", "https://api.deepseek.com/v1"),
        model=os.getenv("MODEL", "deepseek-chat"),
        frontend_origin=os.getenv("FRONTEND_ORIGIN", "http://localhost:3000"),
    )


settings = load_settings()
