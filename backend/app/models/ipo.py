"""IPO model for tracking IPO listings and subscriptions."""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, func

from app.db.base import Base


class IPO(Base):
    __tablename__ = "ipos"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    symbol = Column(String, nullable=True)
    exchange = Column(String, default="NSE")  # NSE, BSE

    # IPO details
    price_band_low = Column(Float, nullable=True)
    price_band_high = Column(Float, nullable=True)
    issue_size = Column(String, nullable=True)  # e.g., "₹5,000 Cr"
    lot_size = Column(Integer, nullable=True)
    issue_type = Column(String, default="Book Built")  # Book Built, Fixed Price

    # Dates
    open_date = Column(DateTime, nullable=True)
    close_date = Column(DateTime, nullable=True)
    listing_date = Column(DateTime, nullable=True)

    # Subscription data
    retail_subscription = Column(Float, nullable=True)  # e.g., 3.5x
    hni_subscription = Column(Float, nullable=True)
    qib_subscription = Column(Float, nullable=True)
    total_subscription = Column(Float, nullable=True)

    # Listing performance
    listing_price = Column(Float, nullable=True)
    listing_gain_pct = Column(Float, nullable=True)
    current_price = Column(Float, nullable=True)

    # Status
    status = Column(String, default="upcoming")  # upcoming, open, closed, listed, withdrawn
    gmp = Column(Float, nullable=True)  # Grey Market Premium

    # AI Analysis
    ai_verdict = Column(String, nullable=True)  # subscribe, avoid, neutral
    ai_reasoning = Column(Text, nullable=True)

    # Metadata
    sector = Column(String, nullable=True)
    registrar = Column(String, nullable=True)
    lead_manager = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
