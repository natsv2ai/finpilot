"""
Unified MCP (Model Context Protocol) API.
Exposes all MCP servers (stock data, news, depository) as API endpoints.
LLM providers can use these as tool sources.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.dependencies import get_current_user
from app.models.user import User
from app.mcp import stock_data_server, news_server, depository_server


router = APIRouter(prefix="/mcp", tags=["MCP (Model Context Protocol)"])


class ToolCallRequest(BaseModel):
    tool_name: str
    arguments: dict = {}


# Merge all tools
ALL_TOOLS = (
    stock_data_server.STOCK_DATA_TOOLS
    + news_server.NEWS_TOOLS
    + depository_server.DEPOSITORY_TOOLS
)

# Merge all handlers
ALL_HANDLERS = {}
ALL_HANDLERS.update(stock_data_server.TOOL_HANDLERS)
ALL_HANDLERS.update(news_server.TOOL_HANDLERS)
ALL_HANDLERS.update(depository_server.TOOL_HANDLERS)


@router.get("/tools")
def list_tools(current_user: User = Depends(get_current_user)):
    """List all available MCP tools across all servers."""
    return {
        "tools": ALL_TOOLS,
        "servers": [
            {"name": "stock_data", "tools": len(stock_data_server.STOCK_DATA_TOOLS)},
            {"name": "news", "tools": len(news_server.NEWS_TOOLS)},
            {"name": "depository", "tools": len(depository_server.DEPOSITORY_TOOLS)},
        ],
    }


@router.post("/call")
async def call_tool(
    payload: ToolCallRequest,
    current_user: User = Depends(get_current_user),
):
    """Execute an MCP tool call."""
    import json

    handler = ALL_HANDLERS.get(payload.tool_name)
    if not handler:
        return {"error": f"Unknown tool: {payload.tool_name}", "available": [t["name"] for t in ALL_TOOLS]}

    result_json = await handler(**payload.arguments)
    if isinstance(result_json, str):
        return json.loads(result_json)
    return result_json
