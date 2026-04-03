from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, func

from app.db.base import Base


class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # term, health, ulip, endowment
    provider = Column(String, default="")
    sum_assured = Column(Float, default=0)
    premium = Column(Float, default=0)
    frequency = Column(String, default="Annual")  # Annual, Monthly, Quarterly
    start_date = Column(String, default="")
    end_date = Column(String, default="")
    nominee = Column(String, default="")
    covers = Column(Text, default="[]")  # JSON array of covered members
    created_at = Column(DateTime, server_default=func.now())
