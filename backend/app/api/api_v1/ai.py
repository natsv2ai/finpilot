"""AI-powered endpoints — stock analysis, news summarization, provider management."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.llm.llm_registry import (
    get_provider,
    set_active_provider,
    list_providers,
    init_from_settings,
)
from app.core.config import settings
from app.mcp.news_server import get_stock_news


router = APIRouter(prefix="/ai", tags=["AI / LLM"])

# Initialize LLM providers from config at import time
try:
    init_from_settings(settings)
except Exception:
    pass


class AnalyzeRequest(BaseModel):
    symbol: str
    quarterly: list[dict] | None = None
    yearly: list[dict] | None = None
    earnings_calls: list[dict] | None = None
    pe: float | None = None
    roe: float | None = None
    de_ratio: float | None = None
    provider: str | None = None  # Override active provider
    asset_type: str = "stock"  # stock or mutual_fund


class ChatRequest(BaseModel):
    prompt: str
    system_prompt: str = ""
    provider: str | None = None


class ProviderSwitchRequest(BaseModel):
    provider: str


@router.get("/providers")
def get_llm_providers(current_user: User = Depends(get_current_user)):
    """List all available LLM providers."""
    return list_providers()


@router.put("/provider")
def switch_provider(
    payload: ProviderSwitchRequest,
    current_user: User = Depends(get_current_user),
):
    """Switch the active LLM provider."""
    try:
        set_active_provider(payload.provider)
        return {"message": f"Switched to {payload.provider}", "provider": payload.provider}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analyze-stock")
async def analyze_stock(
    payload: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
):
    """AI-powered stock analysis using the active LLM provider."""
    provider = get_provider(payload.provider)
    # Fetch live news context for the stock
    news_data = await get_stock_news(payload.symbol, limit=8)
    news_content = "\n".join([f"- {a['title']}: {a['summary']}" for a in news_data.get('articles', [])])

    data = {
        "quarterly": payload.quarterly or [],
        "yearly": payload.yearly or [],
        "earnings_calls": payload.earnings_calls or [],
        "pe": payload.pe,
        "roe": payload.roe,
        "de_ratio": payload.de_ratio,
        "news_context": news_content  # Pass the live news
    }
    
    if payload.asset_type == "mutual_fund":
        # Additional MF specific data can be added here in the future
        result = await provider.analyze_mf(payload.symbol, data)
    else:
        result = await provider.analyze_stock(payload.symbol, data)
    if result.error:
        return {
            "analysis": None,
            "error": result.error,
            "provider": result.provider,
            "model": result.model,
        }
    return {
        "analysis": result.content,
        "provider": result.provider,
        "model": result.model,
        "tokens_used": result.tokens_used,
    }


@router.post("/chat")
async def ai_chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """General-purpose AI chat endpoint."""
    provider = get_provider(payload.provider)
    result = await provider.chat(payload.prompt, payload.system_prompt)
    if result.error:
        return {"response": None, "error": result.error, "provider": result.provider}
    return {
        "response": result.content,
        "provider": result.provider,
        "model": result.model,
        "tokens_used": result.tokens_used,
    }


@router.post("/summarize-news")
async def summarize_news(
    articles: list[dict],
    current_user: User = Depends(get_current_user),
):
    """AI-powered financial news summarization."""
    provider = get_provider()
    result = await provider.summarize_news(articles)
    if result.error:
        return {"summary": None, "error": result.error, "provider": result.provider}
    return {
        "summary": result.content,
        "provider": result.provider,
        "model": result.model,
    }
