"""
Stock Data MCP Server.
Provides real-time and historical stock data as MCP tools.
Uses Yahoo Finance (yfinance) for data fetching.
"""

import json
from datetime import datetime


# MCP Tool definitions for stock data
STOCK_DATA_TOOLS = [
    {
        "name": "get_stock_quote",
        "description": "Get real-time stock quote for an Indian stock (NSE/BSE)",
        "inputSchema": {
            "type": "object",
            "properties": {
                "symbol": {"type": "string", "description": "NSE symbol (e.g., RELIANCE, TCS, INFY)"},
            },
            "required": ["symbol"],
        },
    },
    {
        "name": "get_stock_history",
        "description": "Get historical price data for a stock",
        "inputSchema": {
            "type": "object",
            "properties": {
                "symbol": {"type": "string", "description": "NSE symbol"},
                "period": {"type": "string", "description": "Period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y", "default": "1mo"},
            },
            "required": ["symbol"],
        },
    },
    {
        "name": "get_stock_financials",
        "description": "Get quarterly/annual financial data for a stock",
        "inputSchema": {
            "type": "object",
            "properties": {
                "symbol": {"type": "string", "description": "NSE symbol"},
            },
            "required": ["symbol"],
        },
    },
    {
        "name": "search_stocks",
        "description": "Search for stocks by name or keyword",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query (company name or symbol)"},
            },
            "required": ["query"],
        },
    },
]


async def get_stock_quote(symbol: str) -> dict:
    """Fetch real-time quote for an Indian stock."""
    try:
        import yfinance as yf
        ticker = yf.Ticker(f"{symbol}.NS")
        info = ticker.info
        return {
            "symbol": symbol,
            "name": info.get("longName", symbol),
            "price": info.get("currentPrice", info.get("regularMarketPrice", 0)),
            "change": info.get("regularMarketChange", 0),
            "change_pct": info.get("regularMarketChangePercent", 0),
            "volume": info.get("regularMarketVolume", 0),
            "market_cap": info.get("marketCap", 0),
            "pe_ratio": info.get("trailingPE", 0),
            "52w_high": info.get("fiftyTwoWeekHigh", 0),
            "52w_low": info.get("fiftyTwoWeekLow", 0),
            "sector": info.get("sector", ""),
            "industry": info.get("industry", ""),
        }
    except ImportError:
        return {"error": "yfinance not installed. Run: pip install yfinance", "symbol": symbol}
    except Exception as e:
        return {"error": str(e), "symbol": symbol}


async def get_stock_history(symbol: str, period: str = "1mo") -> dict:
    """Fetch historical price data."""
    try:
        import yfinance as yf
        ticker = yf.Ticker(f"{symbol}.NS")
        hist = ticker.history(period=period)
        records = []
        for date, row in hist.iterrows():
            records.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(row["Open"], 2),
                "high": round(row["High"], 2),
                "low": round(row["Low"], 2),
                "close": round(row["Close"], 2),
                "volume": int(row["Volume"]),
            })
        return {"symbol": symbol, "period": period, "data": records[-50:]}  # Last 50 records
    except ImportError:
        return {"error": "yfinance not installed"}
    except Exception as e:
        return {"error": str(e)}


async def get_stock_financials(symbol: str) -> dict:
    """Fetch quarterly/annual financials."""
    try:
        import yfinance as yf
        ticker = yf.Ticker(f"{symbol}.NS")
        quarterly = ticker.quarterly_financials
        annual = ticker.financials

        def df_to_dict(df):
            if df is None or df.empty:
                return []
            result = []
            for col in df.columns[:4]:  # Last 4 periods
                period_data = {"period": col.strftime("%Y-%m-%d")}
                for idx in df.index:
                    val = df.loc[idx, col]
                    period_data[str(idx)] = float(val) if val == val else 0  # Handle NaN
                result.append(period_data)
            return result

        return {
            "symbol": symbol,
            "quarterly": df_to_dict(quarterly),
            "annual": df_to_dict(annual),
        }
    except ImportError:
        return {"error": "yfinance not installed"}
    except Exception as e:
        return {"error": str(e)}


async def search_stocks(query: str) -> dict:
    """Search for stocks. Uses a basic NSE symbol lookup."""
    # Common Indian stocks for search
    from app.utils.constants import DEMO_STOCKS
    query_upper = query.upper()
    matches = []
    for symbol, info in DEMO_STOCKS.items():
        name = info[0] if isinstance(info, tuple) else symbol
        if query_upper in symbol or query_upper in name.upper():
            matches.append({"symbol": symbol, "name": name})
    return {"query": query, "results": matches[:20]}


# MCP Tool dispatcher
TOOL_HANDLERS = {
    "get_stock_quote": get_stock_quote,
    "get_stock_history": get_stock_history,
    "get_stock_financials": get_stock_financials,
    "search_stocks": search_stocks,
}


async def handle_tool_call(tool_name: str, arguments: dict) -> str:
    """Handle an MCP tool call and return JSON result."""
    handler = TOOL_HANDLERS.get(tool_name)
    if not handler:
        return json.dumps({"error": f"Unknown tool: {tool_name}"})
    result = await handler(**arguments)
    return json.dumps(result, default=str)
