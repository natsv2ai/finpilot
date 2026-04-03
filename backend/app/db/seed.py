from datetime import datetime, timedelta
import random

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.models.holding import Holding, Transaction
from app.models.portfolio import WatchlistItem
from app.utils.constants import DEMO_STOCKS


def seed_demo_data(db: Session):
    """Seed database with demo user, holdings, transactions, and watchlist."""
    # Check if demo user exists
    existing = db.query(User).filter(User.email == "demo@finpilot.com").first()
    if existing:
        return

    # Create demo user
    user = User(
        email="demo@finpilot.com",
        hashed_password=hash_password("finpilot123"),
        name="Demo User",
        risk_appetite="moderate",
    )
    db.add(user)
    db.flush()

    # Create holdings with realistic data
    holdings_data = [
        ("RELIANCE", 25, 2200.00, "groww", "stock"),
        ("TCS", 15, 3500.00, "upstox", "stock"),
        ("HDFCBANK", 40, 1480.00, "groww", "stock"),
        ("INFY", 30, 1420.00, "upstox", "stock"),
        ("ITC", 100, 380.00, "groww", "stock"),
        ("SBIN", 50, 620.00, "manual", "stock"),
        ("BHARTIARTL", 20, 1180.00, "groww", "stock"),
        ("HINDUNILVR", 10, 2150.00, "upstox", "stock"),
        ("BAJFINANCE", 5, 6200.00, "groww", "stock"),
        ("MARUTI", 3, 10200.00, "manual", "stock"),
        ("SUNPHARMA", 35, 980.00, "groww", "mutual_fund"),
        ("TATAMOTORS", 45, 650.00, "upstox", "stock"),
    ]

    for symbol, qty, avg_price, broker, asset_type in holdings_data:
        stock_info = DEMO_STOCKS.get(symbol, (symbol, "Other", avg_price * 1.1))
        name, sector, current_price = stock_info

        holding = Holding(
            user_id=user.id,
            symbol=symbol,
            name=name,
            asset_type=asset_type,
            quantity=qty,
            avg_price=avg_price,
            current_price=current_price,
            broker=broker,
            sector=sector,
        )
        db.add(holding)
        db.flush()

        # Create realistic transaction history for XIRR
        base_date = datetime.now() - timedelta(days=random.randint(180, 730))
        num_txns = random.randint(1, 4)
        remaining_qty = qty

        for i in range(num_txns):
            txn_qty = remaining_qty if i == num_txns - 1 else max(1, remaining_qty // (num_txns - i))
            remaining_qty -= txn_qty
            txn_date = base_date + timedelta(days=random.randint(0, 60) * i)
            txn_price = avg_price * random.uniform(0.9, 1.1)

            txn = Transaction(
                holding_id=holding.id,
                user_id=user.id,
                txn_type="buy",
                quantity=txn_qty,
                price=round(txn_price, 2),
                date=txn_date,
            )
            db.add(txn)

    # Create watchlist items
    watchlist_stocks = ["WIPRO", "AXISBANK", "TITAN", "LTIM"]
    for symbol in watchlist_stocks:
        stock_info = DEMO_STOCKS.get(symbol, (symbol, "Other", 1000.0))
        name, sector, current_price = stock_info

        item = WatchlistItem(
            user_id=user.id,
            symbol=symbol,
            name=name,
            target_price=round(current_price * random.uniform(0.85, 0.95), 2),
            current_price=current_price,
            week_high_52=round(current_price * random.uniform(1.1, 1.3), 2),
            week_low_52=round(current_price * random.uniform(0.65, 0.85), 2),
            change_percent=round(random.uniform(-3.5, 4.5), 2),
        )
        db.add(item)

    db.commit()
