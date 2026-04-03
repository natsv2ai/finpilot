ASSET_TYPES = ["stock", "mutual_fund"]

BROKERS = ["groww", "upstox", "manual", "csv"]

SECTORS = [
    "Technology",
    "Financial Services",
    "Healthcare",
    "Energy",
    "Consumer Goods",
    "Automobile",
    "Pharma",
    "Metals & Mining",
    "Real Estate",
    "Infrastructure",
    "Telecom",
    "FMCG",
    "Other",
]

RISK_LEVELS = ["conservative", "moderate", "aggressive"]

# Sector colors for charts
SECTOR_COLORS = {
    "Technology": "#6366f1",
    "Financial Services": "#f59e0b",
    "Healthcare": "#10b981",
    "Energy": "#ef4444",
    "Consumer Goods": "#8b5cf6",
    "Automobile": "#3b82f6",
    "Pharma": "#14b8a6",
    "Metals & Mining": "#f97316",
    "Real Estate": "#ec4899",
    "Infrastructure": "#64748b",
    "Telecom": "#06b6d4",
    "FMCG": "#84cc16",
    "Other": "#a1a1aa",
}

# Demo stock data: symbol -> (name, sector, current_price)
DEMO_STOCKS = {
    "RELIANCE": ("Reliance Industries", "Energy", 2485.50),
    "TCS": ("Tata Consultancy Services", "Technology", 3820.75),
    "HDFCBANK": ("HDFC Bank", "Financial Services", 1650.30),
    "INFY": ("Infosys", "Technology", 1575.80),
    "ITC": ("ITC Limited", "FMCG", 458.25),
    "SBIN": ("State Bank of India", "Financial Services", 780.90),
    "BHARTIARTL": ("Bharti Airtel", "Telecom", 1420.60),
    "HINDUNILVR": ("Hindustan Unilever", "FMCG", 2340.15),
    "BAJFINANCE": ("Bajaj Finance", "Financial Services", 6890.45),
    "MARUTI": ("Maruti Suzuki", "Automobile", 11450.80),
    "SUNPHARMA": ("Sun Pharma", "Pharma", 1120.35),
    "TATAMOTORS": ("Tata Motors", "Automobile", 780.60),
    "WIPRO": ("Wipro", "Technology", 470.25),
    "AXISBANK": ("Axis Bank", "Financial Services", 1120.40),
    "TITAN": ("Titan Company", "Consumer Goods", 3250.70),
    "LTIM": ("LTIMindtree", "Technology", 5240.90),
}

# CSV template header
CSV_TEMPLATE_HEADER = "symbol,name,quantity,avg_price,broker,buy_date"
CSV_TEMPLATE_EXAMPLE = "RELIANCE,Reliance Industries,10,2300.50,groww,2024-01-15"
