from pydantic import BaseModel
from pydantic import Field, HttpUrl


class SummarizeIn(BaseModel):
    url: HttpUrl
    max_words: int = Field(default=100, ge=40, le=500)


class SummarizeOut(BaseModel):
    summary: str


class BrochureIn(BaseModel):
    url: HttpUrl
    company_name: str = Field(min_length=1, max_length=120)


class BrochureOut(BaseModel):
    brochure: str


class AskIn(BaseModel):
    question: str = Field(min_length=3, max_length=2_000)


class AskOut(BaseModel):
    answer: str
