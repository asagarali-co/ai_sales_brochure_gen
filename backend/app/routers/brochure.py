from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app import llm
from app.prompts import BROCHURE_SYSTEM, LINK_SYSTEM
from app.schemas import BrochureIn
from app.scraper import ScrapeError, fetch_website_contents, fetch_website_links

router = APIRouter(tags=["brochure"])


def select_relevant_links(url: str) -> list[dict]:
    """Step 1: let the model pick which links matter."""
    links = list(dict.fromkeys(fetch_website_links(url)))  # de-duplicate, keep order
    user_prompt = (
        f"Here is the list of links on the website {url}.\n"
        "Decide which are relevant for a brochure about the company. "
        "Respond with full https URLs in JSON. "
        "Do not include Terms of Service, Privacy, or email links.\n\n"
        + "\n".join(links)
    )
    result = llm.chat_json(
        [
            {"role": "system", "content": LINK_SYSTEM},
            {"role": "user", "content": user_prompt},
        ]
    )
    return result.get("links", [])[:5]


def gather_pages(url: str) -> str:
    """Step 2: scrape the landing page plus the chosen links."""
    content = f"## Landing Page:\n\n{fetch_website_contents(url)}\n## Relevant Links:\n"
    for link in select_relevant_links(url):
        try:
            content += f"\n\n### Link: {link['type']}\n{fetch_website_contents(link['url'])}"
        except (ScrapeError, KeyError, TypeError):
            continue  # skip pages that fail
    return content


@router.post("/brochure")
def brochure(body: BrochureIn):
    """Step 3: stream the brochure."""
    llm.require_api_key()
    user_prompt = (
        f"You are looking at a company called: {body.company_name}\n"
        "Here are the contents of its landing page and other relevant pages; "
        "use this information to build a short brochure of the company in markdown "
        "without code blocks.\n\n" + gather_pages(str(body.url))
    )[:5_000]
    messages = [
        {"role": "system", "content": BROCHURE_SYSTEM},
        {"role": "user", "content": user_prompt},
    ]
    return StreamingResponse(
        llm.stream(messages),
        media_type="text/plain; charset=utf-8",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
