from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Holding(Base):
    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    symbol = Column(String, nullable=False)
    name = Column(String, default="")
    asset_type = Column(String, default="stock")  # stock, mutual_fund
    quantity = Column(Float, nullable=False)
    avg_price = Column(Float, nullable=False)
    current_price = Column(Float, default=0)
    broker = Column(String, default="manual")  # groww, upstox, manual, csv
    sector = Column(String, default="Other")
    imported_xirr = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Cascade delete transactions when the holding is deleted
    transactions = relationship(
        "Transaction", back_populates="holding", cascade="all, delete-orphan"
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    holding_id = Column(
        Integer, ForeignKey("holdings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    txn_type = Column(String, nullable=False)  # buy, sell
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    holding = relationship("Holding", back_populates="transactions")
