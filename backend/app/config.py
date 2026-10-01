import os
from dataclasses import field, dataclass
from dotenv import load_dotenv

load_dotenv(override=True)  
@dataclass
class Settings:
    api_key:str
    base_url:str = "https:deepseek.com/api/v1"
    model:str = "deepseek-v4-pro"
    frontend_origin:str = "http://localhost:3000"


def load_settings() -> Settings:
    key = os.getenv("DEEPSEEK_API_KEY")
    if not key:
        raise ValueError("DEEPSEEK_API_KEY is not set")
    return Settings(
        api_key=key,
        base_url=os.getenv("BASE_URL", "https:deepseek.com/api/v1"),
        model=os.getenv("MODEL", "deepseek-v4-pro"),
        frontend_origin=os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
        )

settings = load_settings()
