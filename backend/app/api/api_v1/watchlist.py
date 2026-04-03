from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.portfolio import WatchlistItem
from app.schemas.market_service import WatchlistItemOut, WatchlistItemCreate
from app.utils.constants import DEMO_STOCKS

import random

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


@router.get("", response_model=list[WatchlistItemOut])
def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = db.query(WatchlistItem).filter(WatchlistItem.user_id == current_user.id).all()
    return items


@router.post("", response_model=WatchlistItemOut)
def add_to_watchlist(
    payload: WatchlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    symbol = payload.symbol.upper()

    # Check duplicate
    existing = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == current_user.id, WatchlistItem.symbol == symbol)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already in watchlist")

    # Resolve stock data
    stock_info = DEMO_STOCKS.get(symbol)
    name = payload.name or (stock_info[0] if stock_info else symbol)
    current_price = stock_info[2] if stock_info else 1000.0

    random.seed(hash(symbol))
    item = WatchlistItem(
        user_id=current_user.id,
        symbol=symbol,
        name=name,
        target_price=payload.target_price or round(current_price * 0.9, 2),
        current_price=current_price,
        week_high_52=round(current_price * random.uniform(1.1, 1.3), 2),
        week_low_52=round(current_price * random.uniform(0.65, 0.85), 2),
        change_percent=round(random.uniform(-3.5, 4.5), 2),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def remove_from_watchlist(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.id == item_id, WatchlistItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")

    db.delete(item)
    db.commit()
    return {"message": "Removed from watchlist"}
