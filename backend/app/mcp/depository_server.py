"""
Depository MCP Server.
Provides tools for NSDL/CDSL data access and CAS processing.
"""

import json


DEPOSITORY_TOOLS = [
    {
        "name": "parse_cas_statement",
        "description": "Parse a NSDL/CDSL CAS PDF and extract holdings",
        "inputSchema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string", "description": "Path to the CAS PDF file"},
                "password": {"type": "string", "description": "PDF password (PAN+DOB)", "default": ""},
            },
            "required": ["file_path"],
        },
    },
    {
        "name": "get_depository_info",
        "description": "Get information about NSDL/CDSL integration and how to download CAS",
        "inputSchema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "get_isin_details",
        "description": "Get details for an ISIN (International Securities Identification Number)",
        "inputSchema": {
            "type": "object",
            "properties": {
                "isin": {"type": "string", "description": "ISIN code (e.g., INE002A01018)"},
            },
            "required": ["isin"],
        },
    },
]

# Known ISIN mappings for Indian stocks
ISIN_DATABASE = {
    "INE002A01018": {"symbol": "RELIANCE", "name": "Reliance Industries Ltd", "sector": "Conglomerate"},
    "INE467B01029": {"symbol": "TCS", "name": "Tata Consultancy Services Ltd", "sector": "IT"},
    "INE040A01034": {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd", "sector": "Banking"},
    "INE009A01021": {"symbol": "INFY", "name": "Infosys Ltd", "sector": "IT"},
    "INE090A01021": {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd", "sector": "Banking"},
    "INE062A01020": {"symbol": "SBIN", "name": "State Bank of India", "sector": "Banking"},
    "INE669E01016": {"symbol": "BAJFINANCE", "name": "Bajaj Finance Ltd", "sector": "NBFC"},
    "INE585B01010": {"symbol": "MARUTI", "name": "Maruti Suzuki India Ltd", "sector": "Auto"},
    "INE030A01027": {"symbol": "HINDUNILVR", "name": "Hindustan Unilever Ltd", "sector": "FMCG"},
    "INE154A01025": {"symbol": "ITC", "name": "ITC Ltd", "sector": "FMCG"},
    "INE019A01038": {"symbol": "WIPRO", "name": "Wipro Ltd", "sector": "IT"},
    "INE018A01030": {"symbol": "HCLTECH", "name": "HCL Technologies Ltd", "sector": "IT"},
    "INE238A01034": {"symbol": "AXISBANK", "name": "Axis Bank Ltd", "sector": "Banking"},
    "INE860A01027": {"symbol": "SUNPHARMA", "name": "Sun Pharma Industries Ltd", "sector": "Pharma"},
    "INE397D01024": {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd", "sector": "Telecom"},
}


async def parse_cas_statement(file_path: str, password: str = "") -> dict:
    """Parse CAS PDF from file path."""
    try:
        with open(file_path, "rb") as f:
            content = f.read()
        from app.services.depositories.cas_parser import parse_cas_pdf
        holdings = parse_cas_pdf(content, password)
        return {
            "status": "success",
            "holdings_count": len(holdings),
            "holdings": [
                {"isin": h.isin, "name": h.name, "quantity": h.quantity, "source": h.source, "type": h.asset_type}
                for h in holdings
            ],
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


async def get_depository_info() -> dict:
    """Return depository integration information."""
    return {
        "supported": ["NSDL", "CDSL"],
        "method": "CAS PDF Upload",
        "nsdl": {
            "url": "https://nsdl.co.in",
            "steps": ["Login with PAN", "Go to CAS → Request Statement", "Download PDF", "Upload to FinPilot"],
        },
        "cdsl": {
            "url": "https://www.cdslindia.com",
            "steps": ["Login to My Easi", "Go to Consolidated Account Statement", "Download PDF", "Upload to FinPilot"],
        },
        "password_format": "PAN + DOB (e.g., ABCDE1234F01-Jan-1990)",
    }


async def get_isin_details(isin: str) -> dict:
    """Look up ISIN details."""
    isin = isin.upper()
    if isin in ISIN_DATABASE:
        return {"isin": isin, **ISIN_DATABASE[isin]}
    return {"isin": isin, "error": "ISIN not found in local database"}


TOOL_HANDLERS = {
    "parse_cas_statement": parse_cas_statement,
    "get_depository_info": get_depository_info,
    "get_isin_details": get_isin_details,
}


async def handle_tool_call(tool_name: str, arguments: dict) -> str:
    handler = TOOL_HANDLERS.get(tool_name)
    if not handler:
        return json.dumps({"error": f"Unknown tool: {tool_name}"})
    result = await handler(**arguments)
    return json.dumps(result, default=str)
