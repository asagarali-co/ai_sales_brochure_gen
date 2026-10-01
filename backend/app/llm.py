import json
from typing import Iterator

from openai import OpenAI

from app.config import settings

_client = OpenAI(api_key=settings.api_key, base_url=settings.base_url)


def chat(messages: list[dict]) -> str:
    """One request, one full answer."""
    response = _client.chat.completions.create(model=settings.model, messages=messages)
    return response.choices[0].message.content


def chat_json(messages: list[dict]) -> dict:
    """Ask for a JSON object. The word 'JSON' must appear in the prompt."""
    response = _client.chat.completions.create(
        model=settings.model,
        messages=messages,
        response_format={"type": "json_object"},
    )
    try:
        return json.loads(response.choices[0].message.content)
    except (json.JSONDecodeError, TypeError):
        return {}


def stream(messages: list[dict]) -> Iterator[str]:
    """Yield the answer piece by piece as the model generates it."""
    response = _client.chat.completions.create(
        model=settings.model, messages=messages, stream=True
    )
    try:
        for chunk in response:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta
    except Exception as exc:
        yield f"\n\n**Error while streaming:** {exc}"