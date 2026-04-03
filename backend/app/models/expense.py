from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func

from app.db.base import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String, nullable=False)
    description = Column(String, default="")
    amount = Column(Float, nullable=False)
    type = Column(String, default="variable")  # recurring, variable
    date = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String, nullable=False)
    monthly_limit = Column(Float, default=0)
    created_at = Column(DateTime, server_default=func.now())
