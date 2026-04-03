"""IPO API — Track, analyze, and get AI insights on IPOs."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.ipo import IPO
from app.services.llm.llm_registry import get_provider


router = APIRouter(prefix="/ipos", tags=["IPO Insights"])


# ── Schemas ──

class IPOCreate(BaseModel):
    company_name: str
    symbol: str = ""
    exchange: str = "NSE"
    price_band_low: float | None = None
    price_band_high: float | None = None
    issue_size: str = ""
    lot_size: int | None = None
    issue_type: str = "Book Built"
    open_date: str | None = None
    close_date: str | None = None
    listing_date: str | None = None
    sector: str = ""
    registrar: str = ""
    lead_manager: str = ""
    gmp: float | None = None
    status: str = "upcoming"


class IPOUpdate(BaseModel):
    retail_subscription: float | None = None
    hni_subscription: float | None = None
    qib_subscription: float | None = None
    total_subscription: float | None = None
    listing_price: float | None = None
    listing_gain_pct: float | None = None
    current_price: float | None = None
    gmp: float | None = None
    status: str | None = None


class IPOOut(BaseModel):
    id: int
    company_name: str
    symbol: str
    exchange: str
    price_band_low: float | None
    price_band_high: float | None
    issue_size: str | None
    lot_size: int | None
    issue_type: str
    open_date: str | None
    close_date: str | None
    listing_date: str | None
    retail_subscription: float | None
    hni_subscription: float | None
    qib_subscription: float | None
    total_subscription: float | None
    listing_price: float | None
    listing_gain_pct: float | None
    current_price: float | None
    status: str
    gmp: float | None
    ai_verdict: str | None
    ai_reasoning: str | None
    sector: str | None
    registrar: str | None
    lead_manager: str | None

    class Config:
        from_attributes = True


class IPOAnalysisRequest(BaseModel):
    ipo_id: int | None = None
    company_name: str = ""
    sector: str = ""
    price_band: str = ""
    issue_size: str = ""
    financials: str = ""
    promoter_holding: str = ""
    peer_comparison: str = ""
    purpose_of_issue: str = ""


# ── Sample IPO Data for Development ──

SAMPLE_IPOS = [
    {
        "company_name": "NextGen Semiconductors Ltd",
        "symbol": "NEXTGENSEMI",
        "exchange": "NSE",
        "price_band_low": 540,
        "price_band_high": 570,
        "issue_size": "₹2,800 Cr",
        "lot_size": 26,
        "sector": "Semiconductors",
        "status": "upcoming",
        "gmp": 180,
        "open_date": "2026-03-15",
        "close_date": "2026-03-18",
        "lead_manager": "Kotak Mahindra Capital, ICICI Securities",
    },
    {
        "company_name": "GreenHydro Energy Ltd",
        "symbol": "GREENHYDRO",
        "exchange": "NSE",
        "price_band_low": 320,
        "price_band_high": 340,
        "issue_size": "₹1,500 Cr",
        "lot_size": 44,
        "sector": "Renewable Energy",
        "status": "open",
        "gmp": 95,
        "open_date": "2026-03-01",
        "close_date": "2026-03-04",
        "retail_subscription": 4.2,
        "hni_subscription": 8.7,
        "qib_subscription": 12.3,
        "total_subscription": 8.5,
        "lead_manager": "Axis Capital, JM Financial",
    },
    {
        "company_name": "TechVista AI Solutions Ltd",
        "symbol": "TECHVISTA",
        "exchange": "NSE",
        "price_band_low": 890,
        "price_band_high": 940,
        "issue_size": "₹4,200 Cr",
        "lot_size": 15,
        "sector": "IT / AI",
        "status": "listed",
        "gmp": 320,
        "open_date": "2026-02-10",
        "close_date": "2026-02-13",
        "listing_date": "2026-02-18",
        "listing_price": 1380,
        "listing_gain_pct": 46.8,
        "current_price": 1290,
        "retail_subscription": 12.5,
        "hni_subscription": 38.2,
        "qib_subscription": 56.1,
        "total_subscription": 35.6,
        "lead_manager": "Goldman Sachs, Morgan Stanley India",
        "ai_verdict": "subscribe",
        "ai_reasoning": "Strong AI-first product portfolio with 85% recurring revenue. Market leader in enterprise AI solutions in India. Reasonable valuation at 45x P/E vs global peers at 60x. Strong promoter track record (ex-Google engineers). Risk: High client concentration (top 5 = 60% revenue).",
    },
    {
        "company_name": "Bharat Defence Systems Ltd",
        "symbol": "BHARATDEF",
        "exchange": "BSE",
        "price_band_low": 450,
        "price_band_high": 475,
        "issue_size": "₹3,600 Cr",
        "lot_size": 31,
        "sector": "Defence",
        "status": "listed",
        "listing_price": 580,
        "listing_gain_pct": 22.1,
        "current_price": 620,
        "retail_subscription": 6.8,
        "hni_subscription": 15.4,
        "qib_subscription": 22.7,
        "total_subscription": 15.0,
        "gmp": 120,
        "open_date": "2026-01-20",
        "close_date": "2026-01-23",
        "listing_date": "2026-01-28",
        "lead_manager": "SBI Capital Markets",
        "ai_verdict": "subscribe",
        "ai_reasoning": "Government defence spending at all-time high (₹6.2 lakh Cr in FY26). Order book of ₹18,000 Cr provides 5-year revenue visibility. Make-in-India policy tailwind. Reasonable P/E of 35x vs sector avg 42x. Risk: Government as single customer, long execution cycles.",
    },
    {
        "company_name": "QuickCart Logistics Ltd",
        "symbol": "QUICKCART",
        "exchange": "NSE",
        "price_band_low": 280,
        "price_band_high": 295,
        "issue_size": "₹900 Cr",
        "lot_size": 50,
        "sector": "Logistics / E-commerce",
        "status": "listed",
        "listing_price": 245,
        "listing_gain_pct": -16.9,
        "current_price": 210,
        "retail_subscription": 1.2,
        "hni_subscription": 0.8,
        "qib_subscription": 1.5,
        "total_subscription": 1.2,
        "gmp": -15,
        "open_date": "2026-02-01",
        "close_date": "2026-02-04",
        "listing_date": "2026-02-09",
        "lead_manager": "HDFC Securities",
        "ai_verdict": "avoid",
        "ai_reasoning": "Loss-making for 3 consecutive years. Negative operating cash flow. Intense competition from Delhivery, Blue Dart, and Amazon Logistics. High customer acquisition cost with low retention. Aggressive valuation at 8x revenue for an unprofitable logistics company. Negative GMP indicates market sentiment.",
    },
]


# ── Endpoints ──

@router.get("", response_model=list[IPOOut])
def get_ipos(
    status: str | None = Query(None, description="Filter by status: upcoming, open, closed, listed"),
    sector: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all IPOs with optional status/sector filter."""
    query = db.query(IPO)
    if status:
        query = query.filter(IPO.status == status)
    if sector:
        query = query.filter(IPO.sector.ilike(f"%{sector}%"))
    ipos = query.order_by(desc(IPO.created_at)).all()

    # If no IPOs in DB, return sample data
    if not ipos:
        return [
            IPOOut(
                id=i + 1,
                **{k: (v if k not in ("open_date", "close_date", "listing_date") else v)
                   for k, v in ipo.items()},
            )
            for i, ipo in enumerate(SAMPLE_IPOS)
            if not status or ipo.get("status") == status
        ]

    result = []
    for ipo in ipos:
        result.append(IPOOut(
            id=ipo.id,
            company_name=ipo.company_name,
            symbol=ipo.symbol or "",
            exchange=ipo.exchange or "NSE",
            price_band_low=ipo.price_band_low,
            price_band_high=ipo.price_band_high,
            issue_size=ipo.issue_size,
            lot_size=ipo.lot_size,
            issue_type=ipo.issue_type or "Book Built",
            open_date=ipo.open_date.isoformat() if ipo.open_date else None,
            close_date=ipo.close_date.isoformat() if ipo.close_date else None,
            listing_date=ipo.listing_date.isoformat() if ipo.listing_date else None,
            retail_subscription=ipo.retail_subscription,
            hni_subscription=ipo.hni_subscription,
            qib_subscription=ipo.qib_subscription,
            total_subscription=ipo.total_subscription,
            listing_price=ipo.listing_price,
            listing_gain_pct=ipo.listing_gain_pct,
            current_price=ipo.current_price,
            status=ipo.status or "upcoming",
            gmp=ipo.gmp,
            ai_verdict=ipo.ai_verdict,
            ai_reasoning=ipo.ai_reasoning,
            sector=ipo.sector,
            registrar=ipo.registrar,
            lead_manager=ipo.lead_manager,
        ))
    return result


@router.get("/{ipo_id}", response_model=IPOOut)
def get_ipo(
    ipo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific IPO by ID."""
    ipo = db.query(IPO).filter(IPO.id == ipo_id).first()
    if not ipo:
        # Return from sample data
        if 1 <= ipo_id <= len(SAMPLE_IPOS):
            sample = SAMPLE_IPOS[ipo_id - 1]
            return IPOOut(id=ipo_id, **sample)
        raise HTTPException(status_code=404, detail="IPO not found")

    return IPOOut(
        id=ipo.id,
        company_name=ipo.company_name,
        symbol=ipo.symbol or "",
        exchange=ipo.exchange or "NSE",
        price_band_low=ipo.price_band_low,
        price_band_high=ipo.price_band_high,
        issue_size=ipo.issue_size,
        lot_size=ipo.lot_size,
        issue_type=ipo.issue_type or "Book Built",
        open_date=ipo.open_date.isoformat() if ipo.open_date else None,
        close_date=ipo.close_date.isoformat() if ipo.close_date else None,
        listing_date=ipo.listing_date.isoformat() if ipo.listing_date else None,
        retail_subscription=ipo.retail_subscription,
        hni_subscription=ipo.hni_subscription,
        qib_subscription=ipo.qib_subscription,
        total_subscription=ipo.total_subscription,
        listing_price=ipo.listing_price,
        listing_gain_pct=ipo.listing_gain_pct,
        current_price=ipo.current_price,
        status=ipo.status or "upcoming",
        gmp=ipo.gmp,
        ai_verdict=ipo.ai_verdict,
        ai_reasoning=ipo.ai_reasoning,
        sector=ipo.sector,
        registrar=ipo.registrar,
        lead_manager=ipo.lead_manager,
    )


@router.post("", response_model=IPOOut)
def create_ipo(
    payload: IPOCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new IPO to track."""
    ipo = IPO(
        company_name=payload.company_name,
        symbol=payload.symbol,
        exchange=payload.exchange,
        price_band_low=payload.price_band_low,
        price_band_high=payload.price_band_high,
        issue_size=payload.issue_size,
        lot_size=payload.lot_size,
        issue_type=payload.issue_type,
        open_date=datetime.fromisoformat(payload.open_date) if payload.open_date else None,
        close_date=datetime.fromisoformat(payload.close_date) if payload.close_date else None,
        listing_date=datetime.fromisoformat(payload.listing_date) if payload.listing_date else None,
        sector=payload.sector,
        registrar=payload.registrar,
        lead_manager=payload.lead_manager,
        gmp=payload.gmp,
        status=payload.status,
    )
    db.add(ipo)
    db.commit()
    db.refresh(ipo)

    return IPOOut(
        id=ipo.id,
        company_name=ipo.company_name,
        symbol=ipo.symbol or "",
        exchange=ipo.exchange or "NSE",
        price_band_low=ipo.price_band_low,
        price_band_high=ipo.price_band_high,
        issue_size=ipo.issue_size,
        lot_size=ipo.lot_size,
        issue_type=ipo.issue_type or "Book Built",
        open_date=ipo.open_date.isoformat() if ipo.open_date else None,
        close_date=ipo.close_date.isoformat() if ipo.close_date else None,
        listing_date=ipo.listing_date.isoformat() if ipo.listing_date else None,
        retail_subscription=ipo.retail_subscription,
        hni_subscription=ipo.hni_subscription,
        qib_subscription=ipo.qib_subscription,
        total_subscription=ipo.total_subscription,
        listing_price=ipo.listing_price,
        listing_gain_pct=ipo.listing_gain_pct,
        current_price=ipo.current_price,
        status=ipo.status or "upcoming",
        gmp=ipo.gmp,
        ai_verdict=ipo.ai_verdict,
        ai_reasoning=ipo.ai_reasoning,
        sector=ipo.sector,
        registrar=ipo.registrar,
        lead_manager=ipo.lead_manager,
    )


@router.put("/{ipo_id}", response_model=IPOOut)
def update_ipo(
    ipo_id: int,
    payload: IPOUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update IPO subscription/listing data."""
    ipo = db.query(IPO).filter(IPO.id == ipo_id).first()
    if not ipo:
        raise HTTPException(status_code=404, detail="IPO not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ipo, field, value)

    db.commit()
    db.refresh(ipo)
    return get_ipo(ipo_id, current_user, db)


@router.post("/analyze")
async def analyze_ipo(
    payload: IPOAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    AI-powered IPO analysis with subscribe/avoid recommendation.
    Uses the active LLM provider to analyze IPO fundamentals.
    """
    # Build context from IPO data
    if payload.ipo_id:
        ipo = db.query(IPO).filter(IPO.id == payload.ipo_id).first()
        if ipo:
            context = f"""
Company: {ipo.company_name}
Sector: {ipo.sector or 'N/A'}
Price Band: ₹{ipo.price_band_low or 'N/A'} - ₹{ipo.price_band_high or 'N/A'}
Issue Size: {ipo.issue_size or 'N/A'}
GMP (Grey Market Premium): ₹{ipo.gmp or 'N/A'}
Subscription: Retail {ipo.retail_subscription or 'N/A'}x, HNI {ipo.hni_subscription or 'N/A'}x, QIB {ipo.qib_subscription or 'N/A'}x
Lead Manager: {ipo.lead_manager or 'N/A'}
"""
        else:
            context = ""
    else:
        context = f"""
Company: {payload.company_name}
Sector: {payload.sector}
Price Band: {payload.price_band}
Issue Size: {payload.issue_size}
Financials: {payload.financials}
Promoter Holding: {payload.promoter_holding}
Peer Comparison: {payload.peer_comparison}
Purpose of Issue: {payload.purpose_of_issue}
"""

    prompt = f"""Analyze this IPO and provide a detailed recommendation:

{context}

Provide your analysis in this EXACT format:

**VERDICT:** [SUBSCRIBE / AVOID / NEUTRAL]

**REASONING:**
1. **Business Quality:** [Assess the business model, competitive moat, revenue quality]
2. **Financial Health:** [Revenue growth, profitability, debt levels, cash flows]
3. **Valuation:** [P/E, P/B vs peers, is it fairly priced?]
4. **Market Sentiment:** [GMP indication, sector momentum, market timing]
5. **Risks:** [Top 3 risks that could impact returns]
6. **Promoter/Management:** [Track record, holding, skin in the game]

**BOTTOM LINE:** [2-3 sentence summary of whether retail investors should subscribe and expected listing day returns]"""

    system = """You are a SEBI-registered investment advisor specializing in IPO analysis for Indian markets.
Be data-driven, honest, and clear. Don't hedge unnecessarily — give a clear verdict.
Consider GMP as a market sentiment indicator but not a guarantee.
Always mention risks alongside opportunities."""

    provider = get_provider()
    result = await provider.chat(prompt, system_prompt=system, temperature=0.3)

    # Parse verdict from response
    verdict = "neutral"
    if result.content:
        content_upper = result.content.upper()
        if "SUBSCRIBE" in content_upper and "AVOID" not in content_upper:
            verdict = "subscribe"
        elif "AVOID" in content_upper:
            verdict = "avoid"

    # Save analysis to IPO if it exists in DB
    if payload.ipo_id:
        ipo = db.query(IPO).filter(IPO.id == payload.ipo_id).first()
        if ipo:
            ipo.ai_verdict = verdict
            ipo.ai_reasoning = result.content
            db.commit()

    return {
        "verdict": verdict,
        "analysis": result.content,
        "provider": result.provider,
        "model": result.model,
        "error": result.error,
    }
