from datetime import datetime
from pydantic import BaseModel


# --- Holdings ---
class HoldingOut(BaseModel):
    id: int
    symbol: str
    name: str
    asset_type: str
    quantity: float
    avg_price: float
    current_price: float
    broker: str
    sector: str
    total_value: float
    gain_loss: float
    gain_loss_pct: float
    day_change: float
    day_change_pct: float
    xirr: float | None

    class Config:
        from_attributes = True


class HoldingCreate(BaseModel):
    symbol: str
    name: str = ""
    asset_type: str = "stock"
    quantity: float
    avg_price: float
    current_price: float = 0
    broker: str = "manual"
    sector: str = "Other"


class TransactionOut(BaseModel):
    id: int
    holding_id: int
    txn_type: str
    quantity: float
    price: float
    date: datetime

    class Config:
        from_attributes = True


# --- Portfolio Summary ---
class PortfolioSummary(BaseModel):
    total_value: float
    total_invested: float
    total_gain_loss: float
    total_gain_loss_pct: float
    day_change: float
    day_change_pct: float
    stock_count: int
    mf_count: int


class AllocationItem(BaseModel):
    name: str
    value: float
    percentage: float
    color: str = ""


class PerformancePoint(BaseModel):
    date: str
    value: float


# --- CSV Upload ---
class CSVUploadResult(BaseModel):
    success: int
    failed: int
    errors: list[str]
