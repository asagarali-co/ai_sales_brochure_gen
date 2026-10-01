from pydantic import BaseModel

class SummarizeIn(BaseModel):  
    url: str
    max_words: int = 100

class SummarizeOut(BaseModel):
    summary: str

class BrochureIn(BaseModel):
    url: str
    company_name: str 

class BrochureOut(BaseModel):
    brochure: str

class AskIn(BaseModel):
    question: str

class AskOut(BaseModel):
    questions: list[str]