"""Groww broker integration."""

import httpx
from app.services.brokers.broker_base import BrokerBase, BrokerConfig, BrokerHolding
from app.services.brokers.broker_registry import register_broker


@register_broker
class GrowwBroker(BrokerBase):
    BASE_URL = "https://groww.in/v1/api"

    @property
    def broker_name(self) -> str:
        return "groww"

    @property
    def display_name(self) -> str:
        return "Groww"

    def get_auth_url(self) -> str | None:
        if not self.config.api_key:
            return None
        redirect = self.config.redirect_uri or self.config.extra.get("redirect_uri", "")
        return (
            f"https://groww.in/oauth/connect"
            f"?client_id={self.config.api_key}&redirect_uri={redirect}&response_type=code"
        )

    async def exchange_token(self, code: str) -> str:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://groww.in/oauth/token",
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
                f"{self.BASE_URL}/stocks/holdings/v2",
                headers={"Authorization": f"Bearer {self.access_token}"},
            )
            if resp.status_code != 200:
                return []
            data = resp.json().get("holdings", resp.json().get("data", []))
            return [
                BrokerHolding(
                    symbol=h.get("symbol", h.get("tradingSymbol", "")),
                    name=h.get("companyName", h.get("symbol", "")),
                    quantity=float(h.get("quantity", 0)),
                    avg_price=float(h.get("avgPrice", h.get("averagePrice", 0))),
                    current_price=float(h.get("ltp", h.get("lastPrice", 0))),
                    isin=h.get("isin", ""),
                )
                for h in data
            ]
