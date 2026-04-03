from pydantic import BaseModel


class NetWorthSummary(BaseModel):
    total_assets: float = 0
    total_liabilities: float = 0
    net_worth: float = 0

    # Breakdown
    stocks_value: float = 0
    mutual_funds_value: float = 0
    real_estate_value: float = 0
    gold_value: float = 0
    fd_value: float = 0
    ppf_value: float = 0
    nps_value: float = 0
    epf_value: float = 0
    other_assets_value: float = 0

    # Liabilities
    home_loan: float = 0
    other_loans: float = 0

    # Monthly
    monthly_income_estimate: float = 0
    monthly_expenses: float = 0
    monthly_emi: float = 0
    monthly_sip: float = 0
