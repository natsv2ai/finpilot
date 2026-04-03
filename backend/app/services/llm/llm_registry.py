"""
LLM Provider Registry — manages available LLM providers.
"""

from app.services.llm.llm_base import LLMBase
from app.services.llm.ollama_provider import OllamaProvider
from app.services.llm.huggingface_provider import HuggingFaceProvider


_PROVIDERS: dict[str, LLMBase] = {}
_active_provider: str = "huggingface"


def _init_providers(config: dict | None = None):
    """Initialize default providers. Called once at startup."""
    global _PROVIDERS
    config = config or {}

    _PROVIDERS["ollama"] = OllamaProvider(
        base_url=config.get("OLLAMA_BASE_URL", "http://localhost:11434"),
        model=config.get("OLLAMA_MODEL", "llama3.2"),
    )
    _PROVIDERS["huggingface"] = HuggingFaceProvider(
        api_key=config.get("HUGGINGFACE_API_KEY", ""),
    )

    # Add paid providers if API keys are configured
    openai_key = config.get("OPENAI_API_KEY", "")
    if openai_key:
        try:
            from app.services.llm.openai_provider import OpenAIProvider
            _PROVIDERS["openai"] = OpenAIProvider(api_key=openai_key)
        except ImportError:
            pass

    gemini_key = config.get("GEMINI_API_KEY", "")
    if gemini_key:
        try:
            from app.services.llm.gemini_provider import GeminiProvider
            _PROVIDERS["gemini"] = GeminiProvider(api_key=gemini_key)
        except ImportError:
            pass

    anthropic_key = config.get("ANTHROPIC_API_KEY", "")
    if anthropic_key:
        try:
            from app.services.llm.anthropic_provider import AnthropicProvider
            _PROVIDERS["anthropic"] = AnthropicProvider(api_key=anthropic_key)
        except ImportError:
            pass

    euron_key = config.get("EURON_API_KEY", "")
    if euron_key:
        try:
            from app.services.llm.euron_provider import EuronProvider
            _PROVIDERS["euron"] = EuronProvider(
                api_key=euron_key, 
                base_url=config.get("EURON_URL", "")
            )
        except ImportError:
            pass


def get_provider(name: str | None = None) -> LLMBase:
    """Get an LLM provider by name, or the active default."""
    if not _PROVIDERS:
        _init_providers()
    name = name or _active_provider
    if name not in _PROVIDERS:
        raise ValueError(f"Unknown LLM provider: '{name}'. Available: {', '.join(_PROVIDERS.keys())}")
    return _PROVIDERS[name]


def set_active_provider(name: str):
    """Switch the default active LLM provider."""
    global _active_provider
    if name not in _PROVIDERS:
        raise ValueError(f"Unknown provider: '{name}'")
    _active_provider = name


def list_providers() -> list[dict]:
    """List all available LLM providers with metadata."""
    if not _PROVIDERS:
        _init_providers()
    return [
        {
            "key": name,
            "display_name": p.display_name,
            "is_free": p.is_free,
            "requires_api_key": p.requires_api_key,
            "is_active": name == _active_provider,
        }
        for name, p in _PROVIDERS.items()
    ]


def init_from_settings(settings_obj):
    """Initialize providers from FastAPI settings object."""
    config = {}
    for attr in ["OLLAMA", "OLLAMA_BASE_URL", "OLLAMA_MODEL", "HUGGINGFACE_API_KEY",
                 "OPENAI_API_KEY", "GEMINI_API_KEY", "ANTHROPIC_API_KEY", 
                 "EURON", "EURON_API_KEY", "EURON_URL"]:
        config[attr] = getattr(settings_obj, attr, "")

    _init_providers(config)

    global _active_provider
    # Intelligently route to premium API models if configured in .env
    euron_override = config.get("EURON", "").lower() in ("true", "1", "yes")
    ollama_override = config.get("OLLAMA", "").lower() in ("true", "1", "yes")
    
    if euron_override and "euron" in _PROVIDERS:
        _active_provider = "euron"
    elif ollama_override and "ollama" in _PROVIDERS:
        _active_provider = "ollama"
    elif config.get("OPENAI_API_KEY") and "openai" in _PROVIDERS:
        _active_provider = "openai"
    elif config.get("ANTHROPIC_API_KEY") and "anthropic" in _PROVIDERS:
        _active_provider = "anthropic"
    elif config.get("GEMINI_API_KEY") and "gemini" in _PROVIDERS:
        _active_provider = "gemini"
    else:
        _active_provider = "huggingface"
