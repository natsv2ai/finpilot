from datetime import datetime
from scipy.optimize import brentq


def calculate_xirr(cashflows: list[tuple[datetime, float]]) -> float | None:
    """
    Calculate XIRR (Extended Internal Rate of Return) for a list of cashflows.
    Each cashflow is a tuple of (date, amount) where:
    - Negative amounts represent investments (money going out)
    - Positive amounts represent returns (money coming in)
    Returns the annualized rate as a percentage, or None if calculation fails.
    """
    if not cashflows or len(cashflows) < 2:
        return None

    # Sort by date
    cashflows = sorted(cashflows, key=lambda x: x[0])

    # Check if there are both positive and negative flows
    amounts = [cf[1] for cf in cashflows]
    if all(a >= 0 for a in amounts) or all(a <= 0 for a in amounts):
        return None

    dates = [cf[0] for cf in cashflows]
    values = [cf[1] for cf in cashflows]
    d0 = dates[0]

    def xnpv(rate):
        return sum(
            v / (1 + rate) ** ((d - d0).days / 365.0)
            for d, v in zip(dates, values)
        )

    try:
        result = brentq(xnpv, -0.999, 10.0, maxiter=1000)
        return round(result * 100, 2)  # Return as percentage
    except (ValueError, RuntimeError):
        return None


def format_inr(value: float) -> str:
    """Format value as INR currency string."""
    if value >= 10000000:
        return f"₹{value / 10000000:.2f} Cr"
    elif value >= 100000:
        return f"₹{value / 100000:.2f} L"
    else:
        return f"₹{value:,.2f}"
