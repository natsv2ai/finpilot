"""Angel One (SmartAPI) broker integration."""

import httpx
from app.services.brokers.broker_base import BrokerBase, BrokerConfig, BrokerHolding
from app.services.brokers.broker_registry import register_broker


@register_broker
class AngelOneBroker(BrokerBase):
    BASE_URL = "https://apiconnect.angelbroking.com"

    @property
    def broker_name(self) -> str:
        return "angelone"

    @property
    def display_name(self) -> str:
        return "Angel One"

    @property
    def auth_type(self) -> str:
        return "totp"  # Angel One uses TOTP-based login, not OAuth2

    def get_auth_url(self) -> str | None:
        return None  # No OAuth2 redirect

    async def exchange_token(self, code: str) -> str:
        """For Angel One, 'code' is the TOTP. Login via SmartAPI."""
        client_id = self.config.extra.get("client_id", "")
        password = self.config.extra.get("password", "")
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword",
                json={
                    "clientcode": client_id,
                    "password": password,
                    "totp": code,
                },
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-UserType": "USER",
                    "X-SourceID": "WEB",
                    "X-ClientLocalIP": "127.0.0.1",
                    "X-ClientPublicIP": "127.0.0.1",
                    "X-MACAddress": "00:00:00:00:00:00",
                    "X-PrivateKey": self.config.api_key,
                },
            )
            resp.raise_for_status()
            data = resp.json().get("data", {})
            self.access_token = data.get("jwtToken", code)
            return self.access_token

    async def get_holdings(self) -> list[BrokerHolding]:
        if not self.access_token:
            return []
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self.BASE_URL}/rest/secure/angelbroking/portfolio/v1/getHolding",
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Accept": "application/json",
                    "X-PrivateKey": self.config.api_key,
                    "X-UserType": "USER",
                    "X-SourceID": "WEB",
                },
            )
            if resp.status_code != 200:
                return []
            data = resp.json().get("data", [])
            if not data:
                return []
            return [
                BrokerHolding(
                    symbol=h.get("tradingsymbol", ""),
                    name=h.get("tradingsymbol", ""),
                    quantity=float(h.get("quantity", 0)),
                    avg_price=float(h.get("averageprice", 0)),
                    current_price=float(h.get("ltp", 0)),
                    isin=h.get("isin", ""),
                )
                for h in data
            ]

    def validate_config(self) -> list[str]:
        errors = []
        if not self.config.api_key:
            errors.append("Angel One: API key not configured")
        if not self.config.extra.get("client_id"):
            errors.append("Angel One: Client ID not configured")
        return errors
