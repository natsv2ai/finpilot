from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func

from app.db.base import Base


class WatchlistItem(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    symbol = Column(String, nullable=False)
    name = Column(String, default="")
    target_price = Column(Float, default=0)
    current_price = Column(Float, default=0)
    week_high_52 = Column(Float, default=0)
    week_low_52 = Column(Float, default=0)
    change_percent = Column(Float, default=0)
    added_at = Column(DateTime, server_default=func.now())
