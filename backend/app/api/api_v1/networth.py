from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.holding import Holding
from app.models.asset import Asset
from app.models.expense import Expense
from app.schemas.networth import NetWorthSummary

router = APIRouter(prefix="/networth", tags=["Net Worth"])


@router.get("", response_model=NetWorthSummary)
def get_networth(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Aggregate net worth from all holdings and assets."""
    # Holdings (stocks + mutual funds)
    holdings = db.query(Holding).filter(Holding.user_id == current_user.id).all()
    stocks_value = sum(h.quantity * h.current_price for h in holdings if h.asset_type == "stock")
    mf_value = sum(h.quantity * h.current_price for h in holdings if h.asset_type == "mutual_fund")

    # Other assets
    assets = db.query(Asset).filter(Asset.user_id == current_user.id).all()

    real_estate = sum(a.value for a in assets if a.asset_type == "real_estate")
    gold = sum(a.value for a in assets if a.asset_type == "gold")
    fd = sum(a.value for a in assets if a.asset_type == "fd")
    ppf = sum(a.value for a in assets if a.asset_type == "ppf")
    nps = sum(a.value for a in assets if a.asset_type == "nps")
    epf = sum(a.value for a in assets if a.asset_type == "epf")
    other = sum(a.value for a in assets if a.asset_type not in ("real_estate", "gold", "fd", "ppf", "nps", "epf"))

    # Liabilities
    home_loan = sum(a.loan_outstanding for a in assets if a.asset_type == "real_estate")
    other_loans = sum(a.loan_outstanding for a in assets if a.asset_type != "real_estate")

    total_assets = stocks_value + mf_value + real_estate + gold + fd + ppf + nps + epf + other
    total_liabilities = home_loan + other_loans

    # Monthly expenses
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    monthly_expenses = sum(e.amount for e in expenses)
    monthly_emi = sum(a.emi for a in assets)

    # SIP estimate from recurring investment expenses
    monthly_sip = sum(e.amount for e in expenses if e.type == "recurring" and "sip" in e.category.lower())

    return NetWorthSummary(
        total_assets=round(total_assets, 2),
        total_liabilities=round(total_liabilities, 2),
        net_worth=round(total_assets - total_liabilities, 2),
        stocks_value=round(stocks_value, 2),
        mutual_funds_value=round(mf_value, 2),
        real_estate_value=round(real_estate, 2),
        gold_value=round(gold, 2),
        fd_value=round(fd, 2),
        ppf_value=round(ppf, 2),
        nps_value=round(nps, 2),
        epf_value=round(epf, 2),
        other_assets_value=round(other, 2),
        home_loan=round(home_loan, 2),
        other_loans=round(other_loans, 2),
        monthly_expenses=round(monthly_expenses, 2),
        monthly_emi=round(monthly_emi, 2),
        monthly_sip=round(monthly_sip, 2),
    )
