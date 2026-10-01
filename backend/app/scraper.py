from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
    )
}


class ScrapeError(Exception):
    """Raised when a page can't be fetched. main.py turns it into a 400."""


def _get_soup(url: str) -> BeautifulSoup:
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise ScrapeError(f"Could not fetch {url}: {exc}") from exc
    return BeautifulSoup(response.content, "html.parser")


def fetch_website_contents(url: str, limit: int = 2_000) -> str:
    """Title + visible body text, truncated to `limit` characters."""
    soup = _get_soup(url)
    title = soup.title.string if soup.title and soup.title.string else "No title found"
    text = ""
    if soup.body:
        for tag in soup.body(["script", "style", "img", "input"]):
            tag.decompose()
        text = soup.body.get_text(separator="\n", strip=True)
    return (title + "\n\n" + text)[:limit]


def fetch_website_links(url: str) -> list[str]:
    """Every link on the page, converted to an absolute URL."""
    soup = _get_soup(url)
    hrefs = (a.get("href") for a in soup.find_all("a"))
    return [urljoin(url, h) for h in hrefs if h]