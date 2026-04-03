from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, func

from app.db.base import Base


class StockNews(Base):
    __tablename__ = "stock_news"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, default="", index=True)
    title = Column(String, nullable=False)
    summary = Column(Text, default="")
    source = Column(String, default="")
    url = Column(String, default="")
    image_url = Column(String, default="")
    published_at = Column(DateTime, nullable=True)
    sentiment = Column(String, default="neutral")  # positive, negative, neutral
    created_at = Column(DateTime, server_default=func.now())


class MarketActivity(Base):
    __tablename__ = "market_activity"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False, index=True)
    activity_type = Column(String, nullable=False)  # bulk_deal, block_deal, insider, fii_dii
    investor_name = Column(String, default="")
    quantity = Column(Float, default=0)
    price = Column(Float, default=0)
    action = Column(String, default="")  # buy, sell
    date = Column(String, default="")
    remarks = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())
