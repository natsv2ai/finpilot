"""
Universal Broker Abstraction Layer.
Any broker can implement BrokerBase to be plugged into FinPilot.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class BrokerHolding:
    """Normalized holding from any broker."""
    symbol: str
    name: str
    quantity: float
    avg_price: float
    current_price: float
    asset_type: str = "stock"  # stock, mutual_fund, bond, etf
    sector: str = "Other"
    isin: str = ""


@dataclass
class BrokerOrder:
    """Normalized order/transaction from any broker."""
    symbol: str
    txn_type: str  # buy, sell
    quantity: float
    price: float
    date: str  # ISO format
    order_id: str = ""
    status: str = "complete"


@dataclass
class BrokerConfig:
    """Configuration for a broker connection."""
    name: str
    api_key: str = ""
    api_secret: str = ""
    redirect_uri: str = ""
    extra: dict = field(default_factory=dict)  # Any broker-specific fields


class BrokerBase(ABC):
    """Abstract base class for all broker integrations."""

    def __init__(self, config: BrokerConfig):
        self.config = config
        self.access_token: str | None = None

    @property
    @abstractmethod
    def broker_name(self) -> str:
        """Unique broker identifier (e.g., 'zerodha', 'upstox')."""
        ...

    @property
    @abstractmethod
    def display_name(self) -> str:
        """Human-readable broker name (e.g., 'Zerodha Kite')."""
        ...

    @property
    def auth_type(self) -> str:
        """Authentication method: 'oauth2', 'totp', 'api_key', 'manual'."""
        return "oauth2"

    @abstractmethod
    def get_auth_url(self) -> str | None:
        """Return OAuth2 authorization URL, or None if not applicable."""
        ...

    @abstractmethod
    async def exchange_token(self, code: str) -> str:
        """Exchange authorization code for access token. Returns access_token."""
        ...

    @abstractmethod
    async def get_holdings(self) -> list[BrokerHolding]:
        """Fetch current holdings from broker."""
        ...

    async def get_orders(self, from_date: str | None = None) -> list[BrokerOrder]:
        """Fetch order history. Optional — returns empty by default."""
        return []

    async def refresh_token(self) -> str | None:
        """Refresh access token if expired. Returns new token or None."""
        return None

    def set_access_token(self, token: str):
        """Set the access token for authenticated requests."""
        self.access_token = token

    def validate_config(self) -> list[str]:
        """Return list of missing required config fields."""
        errors = []
        if not self.config.api_key:
            errors.append(f"{self.display_name}: API key not configured")
        return errors
