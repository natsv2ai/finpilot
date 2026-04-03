"""Upstox broker integration."""

import httpx
from app.services.brokers.broker_base import BrokerBase, BrokerConfig, BrokerHolding
from app.services.brokers.broker_registry import register_broker


@register_broker
class UpstoxBroker(BrokerBase):
    BASE_URL = "https://api.upstox.com/v2"

    @property
    def broker_name(self) -> str:
        return "upstox"

    @property
    def display_name(self) -> str:
        return "Upstox"

    def get_auth_url(self) -> str | None:
        if not self.config.api_key:
            return None
        redirect = self.config.redirect_uri or self.config.extra.get("redirect_uri", "")
        return (
            f"{self.BASE_URL}/login/authorization/dialog"
            f"?response_type=code&client_id={self.config.api_key}&redirect_uri={redirect}"
        )

    async def exchange_token(self, code: str) -> str:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.BASE_URL}/login/authorization/token",
                data={
                    "code": code,
                    "client_id": self.config.api_key,
                    "client_secret": self.config.api_secret,
                    "redirect_uri": self.config.redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            resp.raise_for_status()
            data = resp.json()
            self.access_token = data.get("access_token", code)
            return self.access_token

    async def get_holdings(self) -> list[BrokerHolding]:
        if not self.access_token:
            return []
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self.BASE_URL}/portfolio/long-term-holdings",
                headers={"Authorization": f"Bearer {self.access_token}", "Accept": "application/json"},
            )
            if resp.status_code != 200:
                return []
            data = resp.json().get("data", [])
            return [
                BrokerHolding(
                    symbol=h.get("tradingsymbol", h.get("company_name", "")),
                    name=h.get("company_name", h.get("tradingsymbol", "")),
                    quantity=float(h.get("quantity", 0)),
                    avg_price=float(h.get("average_price", 0)),
                    current_price=float(h.get("last_price", 0)),
                    isin=h.get("isin", ""),
                )
                for h in data
            ]
