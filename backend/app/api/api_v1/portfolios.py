import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.holding import Holding
from app.schemas.portfolio_service import PortfolioSummary, AllocationItem, PerformancePoint
from app.utils.constants import SECTOR_COLORS


router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/summary", response_model=PortfolioSummary)
def get_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    holdings = db.query(Holding).filter(Holding.user_id == current_user.id).all()

    total_value = sum(h.quantity * h.current_price for h in holdings)
    total_invested = sum(h.quantity * h.avg_price for h in holdings)
    gain_loss = total_value - total_invested
    gain_loss_pct = (gain_loss / total_invested * 100) if total_invested else 0

    # Simulate daily change
    random.seed(42)
    day_change_pct = round(random.uniform(-2.5, 3.5), 2)
    day_change = round(total_value * day_change_pct / 100, 2)

    stock_count = sum(1 for h in holdings if h.asset_type == "stock")
    mf_count = sum(1 for h in holdings if h.asset_type == "mutual_fund")

    return PortfolioSummary(
        total_value=round(total_value, 2),
        total_invested=round(total_invested, 2),
        total_gain_loss=round(gain_loss, 2),
        total_gain_loss_pct=round(gain_loss_pct, 2),
        day_change=day_change,
        day_change_pct=day_change_pct,
        stock_count=stock_count,
        mf_count=mf_count,
    )


@router.get("/allocation", response_model=list[AllocationItem])
def get_allocation(
    group_by: str = "sector",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    holdings = db.query(Holding).filter(Holding.user_id == current_user.id).all()
    total_value = sum(h.quantity * h.current_price for h in holdings) or 1

    groups: dict[str, float] = {}
    for h in holdings:
        key = h.sector if group_by == "sector" else h.broker
        value = h.quantity * h.current_price
        groups[key] = groups.get(key, 0) + value

    result = []
    for name, value in sorted(groups.items(), key=lambda x: -x[1]):
        pct = round(value / total_value * 100, 2)
        color = SECTOR_COLORS.get(name, "#64748b")
        result.append(AllocationItem(name=name, value=round(value, 2), percentage=pct, color=color))

    return result


@router.get("/performance", response_model=list[PerformancePoint])
def get_performance(
    period: str = "1Y",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate mock performance data over time."""
    holdings = db.query(Holding).filter(Holding.user_id == current_user.id).all()
    total_invested = sum(h.quantity * h.avg_price for h in holdings)
    current_value = sum(h.quantity * h.current_price for h in holdings)

    periods = {"1M": 30, "3M": 90, "6M": 180, "1Y": 365, "3Y": 1095}
    days = periods.get(period, 365)

    points = []
    random.seed(123)
    value = total_invested * 0.92
    daily_growth = (current_value / value) ** (1 / days) if value > 0 else 1.001

    for i in range(days):
        date = (datetime.now() - timedelta(days=days - i)).strftime("%Y-%m-%d")
        value *= daily_growth * random.uniform(0.995, 1.005)
        if i % max(1, days // 60) == 0 or i == days - 1:
            points.append(PerformancePoint(date=date, value=round(value, 2)))

    return points
