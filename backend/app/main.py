from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import ask, brochure, summarize
from app.scraper import ScrapeError

app = FastAPI(title="LLM Week 1 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ScrapeError)
def scrape_error_handler(request: Request, exc: ScrapeError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


app.include_router(summarize.router, prefix="/api")
app.include_router(brochure.router, prefix="/api")
app.include_router(ask.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "model": settings.model}