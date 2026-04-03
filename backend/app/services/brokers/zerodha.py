"""Zerodha Kite Connect broker integration."""

import httpx
from app.services.brokers.broker_base import BrokerBase, BrokerConfig, BrokerHolding
from app.services.brokers.broker_registry import register_broker


@register_broker
class ZerodhaBroker(BrokerBase):
    BASE_URL = "https://api.kite.trade"

    @property
    def broker_name(self) -> str:
        return "zerodha"

    @property
    def display_name(self) -> str:
        return "Zerodha Kite"

    def get_auth_url(self) -> str | None:
        if not self.config.api_key:
            return None
        return f"https://kite.zerodha.com/connect/login?v=3&api_key={self.config.api_key}"

    async def exchange_token(self, code: str) -> str:
        import hashlib
        checksum = hashlib.sha256(
            f"{self.config.api_key}{code}{self.config.api_secret}".encode()
        ).hexdigest()
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.BASE_URL}/session/token",
                data={
                    "api_key": self.config.api_key,
                    "request_token": code,
                    "checksum": checksum,
                },
            )
            resp.raise_for_status()
            data = resp.json().get("data", {})
            self.access_token = data.get("access_token", code)
            return self.access_token

    async def get_holdings(self) -> list[BrokerHolding]:
        if not self.access_token:
            return []
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self.BASE_URL}/portfolio/holdings",
                headers={"Authorization": f"token {self.config.api_key}:{self.access_token}"},
            )
            if resp.status_code != 200:
                return []
            data = resp.json().get("data", [])
            return [
                BrokerHolding(
                    symbol=h.get("tradingsymbol", ""),
                    name=h.get("tradingsymbol", ""),
                    quantity=float(h.get("quantity", 0)),
                    avg_price=float(h.get("average_price", 0)),
                    current_price=float(h.get("last_price", 0)),
                    isin=h.get("isin", ""),
                    sector=h.get("exchange", "NSE"),
                )
                for h in data
            ]
