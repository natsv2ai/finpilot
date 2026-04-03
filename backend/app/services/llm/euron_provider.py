"""Euron Inference API via standard requests."""

import httpx
from app.services.llm.llm_base import LLMBase, LLMResponse

class EuronProvider(LLMBase):
    def __init__(self, api_key: str = "", base_url: str = ""):
        self.api_key = api_key
        self.base_url = base_url or "https://api.euron.one"

    @property
    def provider_name(self) -> str:
        return "euron"

    @property
    def display_name(self) -> str:
        return "Euron AI"

    @property
    def is_free(self) -> bool:
        return False

    @property
    def requires_api_key(self) -> bool:
        return True

    async def chat(self, prompt: str, system_prompt: str = "", temperature: float = 0.7) -> LLMResponse:
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "prompt": full_prompt,
            "max_tokens": 1500
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    self.base_url,
                    headers=headers,
                    json=payload
                )
                resp.raise_for_status()
                data = resp.json()
                
                # Assume the response format depends on Euron's specific schema, 
                # but generically try to extract a string response.
                content = ""
                if isinstance(data, dict):
                    content = data.get("text", data.get("response", data.get("content", str(data))))
                else:
                    content = str(data)
                
                return LLMResponse(content=content, model="euron-default", provider="euron")
        except Exception as e:
            return LLMResponse(content="", model="euron", provider="euron", error=str(e))
