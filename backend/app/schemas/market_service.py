from pydantic import BaseModel


class WatchlistItemOut(BaseModel):
    id: int
    symbol: str
    name: str
    target_price: float
    current_price: float
    week_high_52: float
    week_low_52: float
    change_percent: float

    class Config:
        from_attributes = True


class WatchlistItemCreate(BaseModel):
    symbol: str
    name: str = ""
    target_price: float = 0
