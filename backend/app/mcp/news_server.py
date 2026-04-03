"""
News MCP Server.
Provides financial news aggregation and search as MCP tools.
Uses RSS feeds (free) and optional News API.
"""

import json
from datetime import datetime


NEWS_TOOLS = [
    {
        "name": "get_financial_news",
        "description": "Get latest financial news from Indian markets",
        "inputSchema": {
            "type": "object",
            "properties": {
                "category": {
                    "type": "string",
                    "description": "Category: markets, stocks, mutual_funds, ipo, economy, all",
                    "default": "all",
                },
                "limit": {"type": "integer", "description": "Max articles to return", "default": 10},
            },
        },
    },
    {
        "name": "get_stock_news",
        "description": "Get news specific to a stock symbol",
        "inputSchema": {
            "type": "object",
            "properties": {
                "symbol": {"type": "string", "description": "Stock symbol (e.g., RELIANCE)"},
                "limit": {"type": "integer", "default": 5},
            },
            "required": ["symbol"],
        },
    },
    {
        "name": "get_ipo_news",
        "description": "Get latest IPO news, listings, and upcoming IPOs",
        "inputSchema": {
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "default": 10},
            },
        },
    },
]

# Free dynamic web search for Indian financial news
async def _fetch_ddg_news(query: str, limit: int = 10) -> list[dict]:
    """Fetch live news via DuckDuckGo web search."""
    try:
        from ddgs import DDGS
    except ImportError:
        return [{"error": "duckduckgo-search not installed"}]

    articles = []
    try:
        results = list(DDGS().news(query, max_results=limit))
        for entry in results:
            articles.append({
                "title": entry.get("title", ""),
                "link": entry.get("url", ""),
                "published": "Recent",
                "source": "Web Crawl",
                "summary": entry.get("body", "")[:300],
            })
    except Exception as e:
        import logging
        logging.warning(f"DDG search failed: {e}")

    return articles


async def get_financial_news(category: str = "all", limit: int = 10) -> dict:
    """Get latest financial news."""
    query = f"Indian {category} financial market latest news"
    if category == "all":
        query = "Indian stock market economy latest news"

    articles = await _fetch_ddg_news(query, limit)
    return {"category": category, "count": len(articles), "articles": articles}


async def get_stock_news(symbol: str, limit: int = 5) -> dict:
    """Get news for a specific stock."""
    from app.utils.constants import DEMO_STOCKS
    stock_info = DEMO_STOCKS.get(symbol.upper(), (symbol, "", 0))
    company_name = stock_info[0] if isinstance(stock_info, tuple) else symbol

    query = f"{company_name} ({symbol}) share price stock market latest news"
    articles = await _fetch_ddg_news(query, limit)

    return {"symbol": symbol, "company": company_name, "count": len(articles), "articles": articles}


async def get_ipo_news(limit: int = 10) -> dict:
    """Get latest IPO news."""
    query = "Upcoming Indian IPOs share market latest news listing"
    articles = await _fetch_ddg_news(query, limit)
    return {"category": "ipo", "count": len(articles), "articles": articles}


TOOL_HANDLERS = {
    "get_financial_news": get_financial_news,
    "get_stock_news": get_stock_news,
    "get_ipo_news": get_ipo_news,
}


async def handle_tool_call(tool_name: str, arguments: dict) -> str:
    handler = TOOL_HANDLERS.get(tool_name)
    if not handler:
        return json.dumps({"error": f"Unknown tool: {tool_name}"})
    result = await handler(**arguments)
    return json.dumps(result, default=str)
