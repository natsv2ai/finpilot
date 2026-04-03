from pydantic import BaseModel


class TradeIdea(BaseModel):
    symbol: str
    name: str
    action: str  # buy, sell
    reason: str
    target_price: float
    current_price: float
    upside_pct: float
    confidence: str  # high, medium, low
    sector: str


class InsightCard(BaseModel):
    id: str
    title: str
    description: str
    category: str  # risk, opportunity, alert
    severity: str  # info, warning, critical
    icon: str
