from fastapi import APIRouter

from app import llm
from app.prompts import SUMMARY_SYSTEM, SUMMARY_USER_PREFIX
from app.schemas import SummarizeIn, SummarizeOut
from app.scraper import fetch_website_contents

router = APIRouter(tags=["summarize"])


@router.post("/summarize", response_model=SummarizeOut)
def summarize(body: SummarizeIn):
    website = fetch_website_contents(str(body.url))
    prompt = (
        f"Summarize this website in no more than {body.max_words} words. "
        "Focus on what the organization does, who it is for, and the most useful details.\n\n"
    )
    summary = llm.chat(
        [
            {"role": "system", "content": SUMMARY_SYSTEM},
            {"role": "user", "content": prompt + SUMMARY_USER_PREFIX + website},
        ]
    )
    return {"summary": summary}
