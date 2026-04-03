from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func

from app.db.base import Base


class BrokerConnection(Base):
    __tablename__ = "broker_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    broker_name = Column(String, nullable=False)  # upstox, groww, zerodha, angelone
    access_token = Column(String, default="")
    refresh_token = Column(String, default="")
    token_expiry = Column(DateTime, nullable=True)
    last_synced = Column(DateTime, nullable=True)
    status = Column(String, default="connected")  # connected, disconnected, expired
    created_at = Column(DateTime, server_default=func.now())
