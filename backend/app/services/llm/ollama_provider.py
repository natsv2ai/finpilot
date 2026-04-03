"""
Ollama LLM Provider — FREE, runs locally.
Default provider for development. Requires `ollama` installed and running.

Install: https://ollama.com
Run: ollama pull llama3.2 && ollama serve
"""

import httpx
from app.services.llm.llm_base import LLMBase, LLMResponse


class OllamaProvider(LLMBase):
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.2"):
        self.base_url = base_url
        self.model = model

    @property
    def provider_name(self) -> str:
        return "ollama"

    @property
    def display_name(self) -> str:
        return f"Ollama ({self.model})"

    @property
    def is_free(self) -> bool:
        return True

    @property
    def requires_api_key(self) -> bool:
        return False

    async def chat(self, prompt: str, system_prompt: str = "", temperature: float = 0.7) -> LLMResponse:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": self.model,
                        "messages": messages,
                        "stream": False,
                        "options": {"temperature": temperature},
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                return LLMResponse(
                    content=data.get("message", {}).get("content", ""),
                    model=self.model,
                    provider="ollama",
                    tokens_used=data.get("eval_count", 0),
                )
        except httpx.ConnectError:
            return LLMResponse(
                content="",
                model=self.model,
                provider="ollama",
                error="Ollama not running. Install from https://ollama.com and run: ollama serve",
            )
        except Exception as e:
            return LLMResponse(
                content="",
                model=self.model,
                provider="ollama",
                error=str(e),
            )
