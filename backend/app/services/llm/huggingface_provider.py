"""HuggingFace Inference API — FREE tier available."""

import logging
from huggingface_hub import AsyncInferenceClient
from app.services.llm.llm_base import LLMBase, LLMResponse


class HuggingFaceProvider(LLMBase):
    def __init__(self, api_key: str = "", model: str = "meta-llama/Llama-3.2-3B-Instruct"):
        self.api_key = api_key
        self.model = model

    @property
    def provider_name(self) -> str:
        return "huggingface"

    @property
    def display_name(self) -> str:
        return f"HuggingFace ({self.model.split('/')[-1]})"

    @property
    def is_free(self) -> bool:
        return True

    @property
    def requires_api_key(self) -> bool:
        return False  # Works without key but rate-limited

    async def chat(self, prompt: str, system_prompt: str = "", temperature: float = 0.7) -> LLMResponse:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            client = AsyncInferenceClient(token=self.api_key) if self.api_key else AsyncInferenceClient()
            response = await client.chat_completion(
                model=self.model,
                messages=messages,
                max_tokens=1500,
                temperature=temperature
            )
            content = response.choices[0].message.content
            return LLMResponse(content=content, model=self.model, provider="huggingface")
        except Exception as e:
            logging.error(f"HuggingFace API Error: {e}")
            return LLMResponse(content="", model=self.model, provider="huggingface", error=str(e))
