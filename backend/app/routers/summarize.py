from fastapi import APIRouter

from app import llm
from app.prompts import SUMMARY_SYSTEM, SUMMARY_USER_PREFIX
from app.schemas import SummarizeIn, SummarizeOut
from app.scraper import fetch_website_contents

router = APIRouter(tags=["summarize"])


@router.post("/summarize", response_model=SummarizeOut)
def summarize(body: SummarizeIn):
    website = fetch_website_contents(str(body.url))
    summary = llm.chat(
        [
            {"role": "system", "content": SUMMARY_SYSTEM},
            {"role": "user", "content": SUMMARY_USER_PREFIX + website},
        ]
    )
    return {"summary": summary}