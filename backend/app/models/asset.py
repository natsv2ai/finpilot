from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func

from app.db.base import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    asset_type = Column(String, nullable=False)  # real_estate, gold, fd, ppf, nps, epf
    value = Column(Float, default=0)
    purchase_price = Column(Float, default=0)
    location = Column(String, default="")
    property_type = Column(String, default="")  # Residential, Commercial, Land (for real_estate)
    property_details = Column(String, default="")
    loan_outstanding = Column(Float, default=0)
    emi = Column(Float, default=0)
    interest_rate = Column(Float, default=0)
    maturity_date = Column(String, default="")
    purchase_date = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())
