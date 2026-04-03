from pydantic import BaseModel


class RiskMetrics(BaseModel):
    portfolio_volatility: float  # percentage
    portfolio_beta: float
    sharpe_ratio: float
    max_drawdown: float  # percentage
    concentration_risk: str  # low, medium, high
    top_sector: str
    top_sector_pct: float
    diversification_score: float  # 0-100


class SectorConcentration(BaseModel):
    sector: str
    percentage: float
    status: str  # healthy, warning, critical
