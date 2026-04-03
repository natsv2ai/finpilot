"""
LLM Provider Abstraction Layer.
Supports multiple LLM backends with a free default (Ollama).
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class LLMResponse:
    """Normalized response from any LLM provider."""
    content: str
    model: str
    provider: str
    tokens_used: int = 0
    error: str | None = None


class LLMBase(ABC):
    """Abstract base class for LLM providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        ...

    @property
    @abstractmethod
    def display_name(self) -> str:
        ...

    @property
    def is_free(self) -> bool:
        return False

    @property
    def requires_api_key(self) -> bool:
        return True

    @abstractmethod
    async def chat(self, prompt: str, system_prompt: str = "", temperature: float = 0.7) -> LLMResponse:
        """Send a chat message and get a response."""
        ...

    async def analyze_stock(self, symbol: str, data: dict) -> LLMResponse:
        """Analyze stock data using LLM."""
        prompt = f"""Analyze the stock {symbol} based on the following data:

Balance Sheet (Last 4 Quarters): {data.get('quarterly', 'N/A')}
Annual Summary (2 Years): {data.get('yearly', 'N/A')}
Management Earnings Calls: {data.get('earnings_calls', 'N/A')}
Key Metrics: P/E={data.get('pe', 'N/A')}, ROE={data.get('roe', 'N/A')}%, Debt/Equity={data.get('de_ratio', 'N/A')}

LATEST MARKET CONTEXT & NEWS:
{data.get('news_context', 'No recent news found.')}

Provide:
1. Financial Health Assessment (strong/moderate/weak)
2. Revenue & Profit Trend Analysis
3. Management Credibility Score (based on promise delivery)
4. Key Risks
5. Investment Outlook (bullish/neutral/bearish) with reasoning
6. Price Target Range (if possible)

Format as structured sections with clear headers."""

        system = "You are a senior equity research analyst at a top investment bank. Provide concise, data-driven analysis."
        return await self.chat(prompt, system_prompt=system, temperature=0.3)


    async def analyze_mf(self, symbol: str, data: dict) -> LLMResponse:
        """Analyze mutual fund data using LLM."""
        prompt = f"""Analyze the Mutual Fund '{symbol}' based on the following data:

Asset Breakdown & Core Info: {data.get('holding_info', 'N/A')}
Expense Ratio & Rank: {data.get('metrics', 'N/A')}
Category & Benchmark: {data.get('category', 'Equity/Debt/Hybrid')}

LATEST MARKET CONTEXT, MANAGER NEWS & PEER PERFORMANCE:
{data.get('news_context', 'No recent news found.')}

Provide a comprehensive investment report:
1. **Fund Manager Evaluation**: Track record, credibility, and consistency.
2. **Peer Comparison**: How it ranks against category average and top-performing peers.
3. **Performance Analysis**: Trailing returns vs benchmark and risk-adjusted returns (Alpha/Beta).
4. **Expense Ratio & Taxation**: Impact on long-term wealth.
5. **Risk Assessment**: Volatility, Credit/Market risk, and Category-specific risks.
6. **AI Prediction & Outlook**: Final verdict (Invest/Hold/Redeem) with realistic growth projections.

Format as structured sections with clear professional headers."""

        system = "You are a senior fund research analyst. Provide data-driven, objective mutual fund analysis grounded in live market performance."
        return await self.chat(prompt, system_prompt=system, temperature=0.3)

    async def summarize_news(self, articles: list[dict]) -> LLMResponse:
        """Summarize financial news articles."""
        articles_text = "\n\n".join(
            f"Title: {a.get('title', '')}\nSource: {a.get('source', '')}\nContent: {a.get('content', '')[:500]}"
            for a in articles[:10]
        )
        prompt = f"""Summarize the following financial news articles. Group by theme.
For each group, provide: theme name, key takeaway, market impact (positive/negative/neutral).

{articles_text}

Format as a clean JSON array of objects with keys: theme, takeaway, impact, related_stocks."""

        system = "You are a financial news analyst. Be concise and actionable."
        return await self.chat(prompt, system_prompt=system, temperature=0.3)
