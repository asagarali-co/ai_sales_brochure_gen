from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app import llm
from app.prompts import ASK_SYSTEM
from app.schemas import AskIn

router = APIRouter(tags=["ask"])


@router.post("/ask")
def ask(body: AskIn):
    messages = [
        {"role": "system", "content": ASK_SYSTEM},
        {"role": "user", "content": body.question},
    ]
    return StreamingResponse(
        llm.stream(messages),
        media_type="text/plain; charset=utf-8",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )