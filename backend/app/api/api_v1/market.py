from datetime import datetime
from typing import Optional

import httpx
import feedparser
import re
from fastapi import APIRouter, Depends, Query
from app.mcp.news_server import _fetch_ddg_news
from ddgs import DDGS
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.holding import Holding
from app.models.market_data import StockNews, MarketActivity

router = APIRouter(prefix="/market", tags=["Market Intelligence"])


class NewsItem(BaseModel):
    title: str
    summary: str = ""
    source: str = ""
    url: str = ""
    published_at: str = ""
    sentiment: str = "neutral"
    symbol: str = ""


class ActivityItem(BaseModel):
    symbol: str
    activity_type: str
    investor_name: str = ""
    quantity: float = 0
    price: float = 0
    action: str = ""
    date: str = ""
    remarks: str = ""


async def fetch_live_price(symbol: str) -> tuple[float, float]:
    """
    Fetch live stock price/NAV and daily change % using DuckDuckGo.
    Returns: (price, change_pct)
    """
    price = 0.0
    change_pct = 0.0
    try:
        symbol_upper = symbol.upper()
        # Specialized MF detection logic
        is_mf = len(symbol) > 15 or any(k in symbol_upper for k in ["FUND", "GROWTH", "PLAN", "DIRECT", "REGULAR", "NAV", "LIQUID", "TAX", "CAP"])
        
        # Differentiated search queries
        results = []
        with DDGS() as ddgs:
            # Standard search (.text) is MORE reliable for specific numbers like CMP/NAV than News
            if is_mf:
                query = f"{symbol} Mutual Fund latest NAV Moneycontrol"
            else:
                query = f"{symbol} share price NSE India"
            
            results = list(ddgs.text(query, max_results=5)) or list(ddgs.news(query, max_results=5))
        
        # Regex patterns
        # Catch common price formats: 1,234.56, 150.00, etc.
        price_regex = re.compile(r'(\d{1,6}(?:,\d{3})*(?:\.\d{2,4}))')
        change_regex = re.compile(r'([+-]?\s?\d{1,2}\.\d{1,2}%)')

        for r in results:
            text = (r.get("body", "") + " " + r.get("title", "")).upper()
            
            # Priority 1: Extract % Change
            if change_pct == 0.0:
                c_matches = change_regex.findall(text)
                if c_matches:
                    try:
                        change_pct = float(c_matches[0].replace("%", "").replace(" ", ""))
                    except: pass

            # Priority 2: Extract Price/NAV
            if price == 0.0:
                # Targeted regex for "NAV IS 123.45", "NAV: 123.45", "LTP @ 1000", etc.
                keywords = ["NAV", "LTP", "CMP", "PRICE", "VALUE"]
                for kw in keywords:
                    # Allowing some flexibility between keyword and price (e.g., "NAV is", "LTP @", "Price :")
                    match = re.search(f"{kw}" + r'[\s\w]*?[:\s\-\@₹]*\s*(?:₹|RS\.?\s?)?(\d{1,6}(?:,\d{3})*(?:\.\d{2,4}))', text)
                    if match:
                        try:
                            val = float(match.group(1).replace(",", ""))
                            # Validation
                            if is_mf and val > 2.0: price = val
                            elif not is_mf and val > 10.0: price = val
                            if price > 0: break
                        except: pass
                
                if price > 0: break

                # Fallback: General price match
                p_matches = price_regex.findall(text)
                for m in p_matches:
                    val = float(m.replace(",", ""))
                    if abs(val - abs(change_pct)) < 0.1: continue
                    
                    if is_mf and 5.0 < val < 50000.0:
                        price = val
                        break
                    elif not is_mf and 10.0 < val < 200000.0:
                        price = val
                        break
            
            if price > 0: break

    except Exception:
        pass
    return price, change_pct


# ── RSS Feed URLs for Indian Financial News ──
RSS_FEEDS = [
    ("Economic Times Markets", "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms"),
    ("Moneycontrol Markets", "https://www.moneycontrol.com/rss/MCtopnews.xml"),
    ("Livemint Markets", "https://www.livemint.com/rss/markets"),
]


async def fetch_live_market_news(symbols: list[str] | None = None) -> list[NewsItem]:
    """Fetch live news via DuckDuckGo search."""
    query = "Indian stock market financial news latest"
    if symbols:
        query = f"{', '.join(symbols)} Indian stock latest news analysis"
    
    articles = await _fetch_ddg_news(query, limit=20)
    news_items = []
    for a in articles:
        news_items.append(NewsItem(
            title=a.get("title", ""),
            summary=a.get("summary", ""),
            source=a.get("source", "Web Search"),
            url=a.get("link", ""),
            published_at=a.get("published", ""),
            symbol=symbols[0] if symbols and len(symbols) == 1 else ""
        ))
    return news_items


@router.get("/news", response_model=list[NewsItem])
async def get_market_news(
    symbols: Optional[str] = Query(None, description="Comma-separated stock symbols to filter"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get market news, optionally filtered by portfolio stock symbols."""
    symbol_list = None

    if symbols:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
    else:
        # Default: use user's portfolio symbols
        holdings = db.query(Holding).filter(Holding.user_id == current_user.id).all()
        if holdings:
            symbol_list = list(set(h.symbol for h in holdings))

    # First check cached news in DB
    cached = db.query(StockNews).order_by(StockNews.published_at.desc()).limit(30).all()
    if cached:
        items = [NewsItem(
            title=n.title, summary=n.summary, source=n.source,
            url=n.url, published_at=n.published_at.isoformat() if n.published_at else "",
            sentiment=n.sentiment, symbol=n.symbol,
        ) for n in cached]
        if symbol_list:
            items = [n for n in items if not n.symbol or n.symbol.upper() in symbol_list]
        if items:
            return items

    # Fallback: fetch fresh from DDG
    return await fetch_live_market_news(symbol_list)


@router.get("/activity", response_model=list[ActivityItem])
def get_investor_activity(
    symbol: Optional[str] = Query(None, description="Stock symbol"),
    activity_type: Optional[str] = Query(None, description="bulk_deal, block_deal, insider, fii_dii"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get bulk deals, block deals, and insider trading activity."""
    query = db.query(MarketActivity)
    if symbol:
        query = query.filter(MarketActivity.symbol == symbol.upper())
    if activity_type:
        query = query.filter(MarketActivity.activity_type == activity_type)

    activities = query.order_by(MarketActivity.id.desc()).limit(50).all()

    # If no cached data, return sample data to show the UI
    if not activities:
        return _get_sample_activity(symbol)

    return [ActivityItem(
        symbol=a.symbol, activity_type=a.activity_type,
        investor_name=a.investor_name, quantity=a.quantity,
        price=a.price, action=a.action, date=a.date,
        remarks=a.remarks,
    ) for a in activities]


def _get_sample_activity(symbol: str | None = None) -> list[ActivityItem]:
    """Return sample investor activity data for demonstration."""
    sample = [
        ActivityItem(symbol="RELIANCE", activity_type="bulk_deal", investor_name="Vanguard Group", quantity=500000, price=2700.50, action="buy", date="2026-02-25", remarks="Long-term investment"),
        ActivityItem(symbol="RELIANCE", activity_type="insider", investor_name="Mukesh Ambani (Promoter)", quantity=200000, price=2680.00, action="buy", date="2026-02-20", remarks="Promoter acquisition"),
        ActivityItem(symbol="TCS", activity_type="bulk_deal", investor_name="BlackRock Inc", quantity=300000, price=3950.00, action="buy", date="2026-02-24", remarks="FII investment"),
        ActivityItem(symbol="TCS", activity_type="block_deal", investor_name="Goldman Sachs", quantity=150000, price=3920.75, action="sell", date="2026-02-22", remarks="Portfolio rebalancing"),
        ActivityItem(symbol="HDFCBANK", activity_type="insider", investor_name="Sashidhar Jagdishan (MD)", quantity=50000, price=1620.00, action="buy", date="2026-02-21", remarks="ESOP exercise"),
        ActivityItem(symbol="INFY", activity_type="bulk_deal", investor_name="Fidelity Investments", quantity=400000, price=1580.25, action="buy", date="2026-02-23", remarks="IT sector bet"),
        ActivityItem(symbol="INFY", activity_type="insider", investor_name="Salil Parekh (CEO)", quantity=25000, price=1570.00, action="sell", date="2026-02-19", remarks="Personal sale"),
        ActivityItem(symbol="ITC", activity_type="fii_dii", investor_name="FII (Net)", quantity=1200000, price=450.50, action="buy", date="2026-02-25", remarks="Continued FII buying"),
        ActivityItem(symbol="SBIN", activity_type="bulk_deal", investor_name="LIC of India", quantity=800000, price=770.00, action="buy", date="2026-02-24", remarks="Strategic investment"),
        ActivityItem(symbol="BAJFINANCE", activity_type="insider", investor_name="Rajiv Jain (MD)", quantity=10000, price=7200.00, action="buy", date="2026-02-20", remarks="ESOP exercise"),
    ]
    if symbol:
        return [a for a in sample if a.symbol == symbol.upper()]
    return sample


@router.get("/fii-dii")
def get_fii_dii_data(
    current_user: User = Depends(get_current_user),
):
    """Get latest FII/DII buy-sell data."""
    # Sample data — in production, scrape from NSE or use API
    return [
        {"date": "2026-02-27", "fii_buy": 12500.0, "fii_sell": 8200.0, "fii_net": 4300.0, "dii_buy": 9800.0, "dii_sell": 7100.0, "dii_net": 2700.0},
        {"date": "2026-02-26", "fii_buy": 11200.0, "fii_sell": 13500.0, "fii_net": -2300.0, "dii_buy": 10500.0, "dii_sell": 6800.0, "dii_net": 3700.0},
        {"date": "2026-02-25", "fii_buy": 14800.0, "fii_sell": 9200.0, "fii_net": 5600.0, "dii_buy": 8200.0, "dii_sell": 9100.0, "dii_net": -900.0},
        {"date": "2026-02-24", "fii_buy": 10000.0, "fii_sell": 11800.0, "fii_net": -1800.0, "dii_buy": 11500.0, "dii_sell": 7500.0, "dii_net": 4000.0},
        {"date": "2026-02-21", "fii_buy": 13200.0, "fii_sell": 10500.0, "fii_net": 2700.0, "dii_buy": 9500.0, "dii_sell": 8200.0, "dii_net": 1300.0},
    ]
