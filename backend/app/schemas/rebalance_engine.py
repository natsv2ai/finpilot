from pydantic import BaseModel


class RebalanceSuggestion(BaseModel):
    asset: str
    current_pct: float
    target_pct: float
    action: str  # buy, sell, hold
    amount: float
    reason: str


class RebalanceResponse(BaseModel):
    suggestions: list[RebalanceSuggestion]
    overall_health: str  # good, needs_attention, critical
    summary: str
