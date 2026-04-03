from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.holding import Holding
from app.schemas.risk_engine import RiskMetrics, SectorConcentration
from app.schemas.rebalance_engine import RebalanceSuggestion, RebalanceResponse
from app.schemas.ai_service import TradeIdea, InsightCard
from app.utils.constants import DEMO_STOCKS


router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("/risk", response_model=RiskMetrics)
def get_risk_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    holdings = db.query(Holding).filter(Holding.user_id == current_user.id).all()
    total_value = sum(h.quantity * h.current_price for h in holdings) or 1

    # Calculate sector concentrations
    sectors: dict[str, float] = {}
    for h in holdings:
        val = h.quantity * h.current_price
        sectors[h.sector] = sectors.get(h.sector, 0) + val

    top_sector = max(sectors, key=sectors.get) if sectors else "N/A"
    top_sector_pct = round(sectors.get(top_sector, 0) / total_value * 100, 2) if sectors else 0

    concentration_risk = "low" if top_sector_pct < 30 else ("medium" if top_sector_pct < 50 else "high")
    num_sectors = len(sectors)
    diversification = min(100, round(num_sectors / 8 * 60 + (100 - top_sector_pct) * 0.4, 1))

    return RiskMetrics(
        portfolio_volatility=18.5,
        portfolio_beta=1.12,
        sharpe_ratio=1.45,
        max_drawdown=12.3,
        concentration_risk=concentration_risk,
        top_sector=top_sector,
        top_sector_pct=top_sector_pct,
        diversification_score=diversification,
    )


@router.get("/sectors", response_model=list[SectorConcentration])
def get_sector_concentration(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    holdings = db.query(Holding).filter(Holding.user_id == current_user.id).all()
    total_value = sum(h.quantity * h.current_price for h in holdings) or 1

    sectors: dict[str, float] = {}
    for h in holdings:
        val = h.quantity * h.current_price
        sectors[h.sector] = sectors.get(h.sector, 0) + val

    result = []
    for sector, value in sorted(sectors.items(), key=lambda x: -x[1]):
        pct = round(value / total_value * 100, 2)
        status = "healthy" if pct < 25 else ("warning" if pct < 40 else "critical")
        result.append(SectorConcentration(sector=sector, percentage=pct, status=status))

    return result


@router.get("/rebalance", response_model=RebalanceResponse)
def get_rebalance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    holdings = db.query(Holding).filter(Holding.user_id == current_user.id).all()
    total_value = sum(h.quantity * h.current_price for h in holdings) or 1

    # Simple target: equal sector allocation
    sectors: dict[str, float] = {}
    for h in holdings:
        val = h.quantity * h.current_price
        sectors[h.sector] = sectors.get(h.sector, 0) + val

    num_sectors = len(sectors) or 1
    target_pct = round(100 / num_sectors, 1)

    suggestions = []
    issues = 0
    for sector, value in sorted(sectors.items(), key=lambda x: -x[1]):
        current_pct = round(value / total_value * 100, 1)
        diff = current_pct - target_pct
        if abs(diff) > 5:
            issues += 1
            action = "sell" if diff > 0 else "buy"
            amount = round(abs(diff) * total_value / 100, 2)
            reason = f"{'Overweight' if diff > 0 else 'Underweight'} by {abs(diff):.1f}% vs equal allocation target"
            suggestions.append(RebalanceSuggestion(
                asset=sector,
                current_pct=current_pct,
                target_pct=target_pct,
                action=action,
                amount=amount,
                reason=reason,
            ))

    health = "good" if issues == 0 else ("needs_attention" if issues <= 2 else "critical")

    return RebalanceResponse(
        suggestions=suggestions,
        overall_health=health,
        summary=f"Portfolio has {len(sectors)} sectors. {issues} sectors need rebalancing for equal allocation.",
    )


@router.get("/ideas", response_model=list[TradeIdea])
def get_trade_ideas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_symbols = set(
        h.symbol
        for h in db.query(Holding).filter(Holding.user_id == current_user.id).all()
    )

    ideas = []
    # Buy ideas: stocks not in portfolio
    for symbol, (name, sector, price) in DEMO_STOCKS.items():
        if symbol not in user_symbols and len(ideas) < 3:
            target = round(price * 1.15, 2)
            ideas.append(TradeIdea(
                symbol=symbol,
                name=name,
                action="buy",
                reason=f"Strong fundamentals in {sector} sector. Trading below intrinsic value with consistent earnings growth.",
                target_price=target,
                current_price=price,
                upside_pct=15.0,
                confidence="high" if sector == "Technology" else "medium",
                sector=sector,
            ))

    # Sell ideas: poor performers in portfolio
    holdings = db.query(Holding).filter(Holding.user_id == current_user.id).all()
    for h in holdings[:2]:
        if h.current_price < h.avg_price:
            ideas.append(TradeIdea(
                symbol=h.symbol,
                name=h.name,
                action="sell",
                reason="Stock trading below average purchase price. Consider booking losses for tax harvesting.",
                target_price=round(h.avg_price * 0.95, 2),
                current_price=h.current_price,
                upside_pct=round((h.avg_price * 0.95 / h.current_price - 1) * 100, 2),
                confidence="medium",
                sector=h.sector,
            ))

    return ideas[:5]


@router.get("/cards", response_model=list[InsightCard])
def get_insight_cards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return [
        InsightCard(
            id="1",
            title="Portfolio Diversification",
            description="Your portfolio is concentrated in Financial Services. Consider adding exposure to Healthcare and Technology sectors.",
            category="risk",
            severity="warning",
            icon="⚠️",
        ),
        InsightCard(
            id="2",
            title="High XIRR Alert",
            description="ITC and SBIN holdings show XIRR above 25%. Consider booking partial profits.",
            category="opportunity",
            severity="info",
            icon="📈",
        ),
        InsightCard(
            id="3",
            title="Market Momentum",
            description="Nifty 50 is trading near all-time highs. Maintain stop-loss levels on momentum stocks.",
            category="alert",
            severity="info",
            icon="🔔",
        ),
        InsightCard(
            id="4",
            title="Tax Harvesting Opportunity",
            description="2 holdings are showing unrealised losses. Consider selling to offset capital gains.",
            category="opportunity",
            severity="info",
            icon="💰",
        ),
    ]
