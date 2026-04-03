import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.holding import Holding, Transaction
from app.schemas.portfolio_service import HoldingOut, HoldingCreate, CSVUploadResult
from app.utils.helpers import calculate_xirr
from app.utils.constants import DEMO_STOCKS
from app.api.api_v1.market import fetch_live_price


router = APIRouter(prefix="/holdings", tags=["Holdings"])


def _build_holding_out(holding: Holding, transactions: list[Transaction], live_price: float = 0.0, live_change_pct: float = 0.0) -> HoldingOut:
    current_price = live_price if live_price > 0 else holding.current_price
    total_value = holding.quantity * current_price
    invested = holding.quantity * holding.avg_price
    gain_loss = total_value - invested
    gain_loss_pct = (gain_loss / invested * 100) if invested else 0

    # Use live change if available, otherwise fallback to seed-based simulation
    if live_change_pct != 0.0:
        day_change_pct = live_change_pct
    else:
        import random
        random.seed(holding.id)
        day_change_pct = round(random.uniform(-3.0, 4.0), 2)
    
    day_change = round(current_price * day_change_pct / 100 * holding.quantity, 2)

    # Calculate XIRR
    xirr_val = holding.imported_xirr
    
    if xirr_val is None:
        cashflows = []
        for txn in transactions:
            amount = -txn.quantity * txn.price if txn.txn_type == "buy" else txn.quantity * txn.price
            cashflows.append((txn.date, amount))
        # Add current value as a positive cashflow today
        if cashflows:
            cashflows.append((datetime.now(), total_value))
        xirr_val = calculate_xirr(cashflows)

    return HoldingOut(
        id=holding.id,
        symbol=holding.symbol,
        name=holding.name,
        asset_type=holding.asset_type,
        quantity=round(holding.quantity, 4),
        avg_price=round(holding.avg_price, 4),
        current_price=round(current_price, 4),
        broker=holding.broker,
        sector=holding.sector,
        total_value=round(total_value, 2),
        gain_loss=round(gain_loss, 2),
        gain_loss_pct=round(gain_loss_pct, 2),
        day_change=round(day_change, 2),
        day_change_pct=round(day_change_pct, 2),
        xirr=xirr_val,
    )


@router.get("", response_model=list[HoldingOut])
async def get_holdings(
    broker: str | None = None,
    asset_type: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Holding).filter(Holding.user_id == current_user.id)
    if broker:
        query = query.filter(Holding.broker == broker)
    if asset_type:
        query = query.filter(Holding.asset_type == asset_type)
    
    holdings = query.all()
    result = []
    for h in holdings:
        # Fetch live price for stocks and MFs
        live_price = 0.0
        live_change_pct = 0.0
        live_price, live_change_pct = await fetch_live_price(h.symbol)
            
        txns = db.query(Transaction).filter(Transaction.holding_id == h.id).all()
        result.append(_build_holding_out(h, txns, live_price, live_change_pct))
    return result


@router.get("/{holding_id}", response_model=HoldingOut)
def get_holding(
    holding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    holding = (
        db.query(Holding)
        .filter(Holding.id == holding_id, Holding.user_id == current_user.id)
        .first()
    )
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    txns = db.query(Transaction).filter(Transaction.holding_id == holding.id).all()
    return _build_holding_out(holding, txns)


@router.delete("/{holding_id}")
def delete_holding(
    holding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a specific holding."""
    holding = (
        db.query(Holding)
        .filter(Holding.id == holding_id, Holding.user_id == current_user.id)
        .first()
    )
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")

    db.delete(holding)
    db.commit()
    return {"message": "Holding deleted successfully"}


@router.post("", response_model=HoldingOut)
def create_holding(
    payload: HoldingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Look up current price from demo data if not provided
    current_price = payload.current_price
    if current_price == 0 and payload.symbol in DEMO_STOCKS:
        current_price = DEMO_STOCKS[payload.symbol][2]

    holding = Holding(
        user_id=current_user.id,
        symbol=payload.symbol.upper(),
        name=payload.name or DEMO_STOCKS.get(payload.symbol.upper(), (payload.symbol, "", 0))[0],
        asset_type=payload.asset_type,
        quantity=payload.quantity,
        avg_price=payload.avg_price,
        current_price=current_price,
        broker=payload.broker,
        sector=payload.sector or DEMO_STOCKS.get(payload.symbol.upper(), ("", "", 0, "Other"))[1],
    )
    db.add(holding)
    db.flush()

    # Create initial buy transaction
    txn = Transaction(
        holding_id=holding.id,
        user_id=current_user.id,
        txn_type="buy",
        quantity=payload.quantity,
        price=payload.avg_price,
        date=datetime.now(),
    )
    db.add(txn)
    db.commit()
    db.refresh(holding)

    txns = db.query(Transaction).filter(Transaction.holding_id == holding.id).all()
    return _build_holding_out(holding, txns)


@router.post("/import", response_model=list[HoldingOut])
def import_from_broker(
    broker: str = "groww",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mock broker import — adds sample holdings for the specified broker."""
    import random
    sample_symbols = list(DEMO_STOCKS.keys())
    random.shuffle(sample_symbols)
    selected = sample_symbols[:3]

    result = []
    for symbol in selected:
        name, sector, price = DEMO_STOCKS[symbol]
        existing = (
            db.query(Holding)
            .filter(
                Holding.user_id == current_user.id,
                Holding.symbol == symbol,
                Holding.broker == broker,
            )
            .first()
        )
        if existing:
            continue

        qty = random.randint(5, 50)
        avg = round(price * random.uniform(0.85, 0.98), 2)

        holding = Holding(
            user_id=current_user.id,
            symbol=symbol,
            name=name,
            asset_type="stock",
            quantity=qty,
            avg_price=avg,
            current_price=price,
            broker=broker,
            sector=sector,
        )
        db.add(holding)
        db.flush()

        txn = Transaction(
            holding_id=holding.id,
            user_id=current_user.id,
            txn_type="buy",
            quantity=qty,
            price=avg,
            date=datetime.now(),
        )
        db.add(txn)
        db.flush()

        txns = [txn]
        result.append(_build_holding_out(holding, txns))

    db.commit()
    return result


# ── CSV Column Auto-Detection ──

COLUMN_MAPPINGS = {
    "symbol": ["symbol", "symbols", "scrip", "scrip_name", "stock", "stock_name", "ticker", "isin", "instrument", "security", "scheme", "scheme_name", "scheme_code", "mutual fund name"],
    "name": ["name", "company", "description"],
    "quantity": ["quantity", "qty", "share", "unit", "nos"],
    "avg_price": ["avg_price", "average_price", "buy_price", "purchase_price", "avg", "cost", "avg nav", "purchase nav"],
    "invested_amount": ["invested amount", "cost value", "buy value", "amount invested", "investment value"],
    "broker": ["broker", "platform", "source", "exchange", "depot", "dp", "account"],
    "buy_date": ["buy_date", "purchase_date", "date", "trade_date", "txn_date"],
    "current_price": ["current_price", "ltp", "cmp", "market_price", "last_price", "close", "nav", "net asset value"],
    "asset_type": ["asset_type", "type", "category", "segment", "product"],
    "xirr": ["xirr", "internal rate of return", "return %", "cagr", "annualized return"],
}

def _detect_columns(headers: list[str]) -> dict[str, str | None]:
    """Auto-detect which CSV column maps to which internal field with substring matching."""
    mapping: dict[str, str | None] = {}
    for field, aliases in COLUMN_MAPPINGS.items():
        mapping[field] = None
        # 1. Exact match (ignore spaces and dots)
        for h in headers:
            h_str = str(h)
            h_clean = h_str.lower().replace(".", "").replace(" ", "").replace("_", "")
            if any(a.replace("_", "") == h_clean for a in aliases):
                mapping[field] = h
                break
        # 2. Substring match
        if mapping[field] is None:
            for h in headers:
                h_str = str(h)
                h_clean = h_str.lower().replace(".", "").replace(" ", "").replace("_", "")
                if any(a.replace("_", "") in h_clean for a in aliases if len(a.replace("_", "")) > 2):
                    mapping[field] = h
                    break
    return mapping


def _parse_date(date_str: str) -> datetime:
    """Try multiple date formats."""
    date_str = date_str.strip()
    formats = [
        "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d",
        "%d-%b-%Y", "%d %b %Y", "%d-%B-%Y",
        "%Y-%m-%d %H:%M:%S", "%d-%m-%Y %H:%M:%S",
        "%m/%d/%Y", "%Y%m%d",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return datetime.now()


def _parse_float(val: str) -> float:
    """Parse float from string, handling commas and currency symbols."""
    if not val:
        return 0.0
    cleaned = val.strip().replace(",", "").replace("₹", "").replace("Rs.", "").replace("Rs", "").replace("INR", "").replace("%", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


import pandas as pd
import re

@router.post("/upload-csv", response_model=CSVUploadResult)
async def upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a CSV or Excel file with holdings. Auto-detects column names.
    Supports exports from Zerodha, Groww, Upstox, Angel One, and custom formats.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")
    
    filename = file.filename.lower()
    if not (filename.endswith(".csv") or filename.endswith(".xls") or filename.endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV, XLS, and XLSX files are accepted")

    content = await file.read()
    
    try:
        if filename.endswith(".csv"):
            try:
                text = content.decode("utf-8")
            except UnicodeDecodeError:
                text = content.decode("latin-1", errors="ignore")
                
            delimiter = ","
            first_line = text.split("\n")[0]
            if "\t" in first_line and "," not in first_line:
                delimiter = "\t"
            elif ";" in first_line and "," not in first_line:
                delimiter = ";"
                
            df = pd.read_csv(io.StringIO(text), sep=delimiter)
        else:
            df = pd.read_excel(io.BytesIO(content))
            
    except Exception as e:
         raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    if df.empty or len(df.columns) == 0:
        raise HTTPException(status_code=400, detail="File is empty or has no columns")

    # Try to locate the actual header row
    def score_row(r_vals):
        score = 0
        r_str = [str(x).strip().lower() for x in r_vals if pd.notna(x)]
        joined = " ".join(r_str)
        if "symbol" in joined or "ticker" in joined or "scrip" in joined: score += 2
        if "qty" in joined or "quantity" in joined or "shares" in joined: score += 1
        if "price" in joined or "ltp" in joined or "cmp" in joined or "nav" in joined: score += 1
        if "category" in joined or "instrument" in joined or "asset" in joined: score += 1
        return score

    best_row_idx = -1
    best_score = 0
    
    # Check current headers first
    curr_score = score_row(df.columns)
    if curr_score > 0:
        best_score = curr_score
        
    for i in range(min(30, len(df))):
        s = score_row(df.iloc[i].values)
        if s > best_score:
            best_score = s
            best_row_idx = i

    if best_row_idx >= 0:
        df.columns = df.iloc[best_row_idx]
        df = df.iloc[best_row_idx+1:].reset_index(drop=True)

    # Clean up column names after finding header
    df.columns = df.columns.astype(str)
    df = df.fillna("")

    # Auto-detect column mappings
    col_map = _detect_columns(list(df.columns))

    async def fetch_holding_info(sym: str) -> dict:
        """Fetch live info for stock or mutual fund."""
        try:
            price = await fetch_live_price(sym)
            # Try to guess name if it's a mutual fund
            name = sym if len(sym) > 10 else sym
            return {"name": name, "price": price, "sector": "Other"}
        except:
            return {}

    success = 0
    failed = 0
    errors: list[str] = []

    symbol_data_cache = {}

    for i, row_data in df.iterrows():
        try:
            row = row_data.to_dict()
            
            # Extract symbol
            symbol_col = col_map["symbol"]
            symbol = ""
            if symbol_col and symbol_col in row and str(row[symbol_col]).strip():
                symbol = str(row[symbol_col]).strip().upper()
            else:
                for v in row.values():
                    val = str(v).strip().upper()
                    # Specialized Differentiated Validation
                    # 1. MF Check (Long name or keywords)
                    is_p_mf = len(val) > 15 or any(k in val for k in ["FUND", "GROWTH", "PLAN", "DIRECT", "REGULAR", "NAV"])
                    # 2. Stock Check (Short, alphanumeric)
                    is_p_stock = 2 <= len(val) <= 12 and re.match(r'^[A-Z0-9&.\-]+$', val)
                    
                    if val and (is_p_stock or is_p_mf):
                        if not any(x in val for x in ["TOTAL", "GRAND", "CATEGORY", "INSTRUMENT", "HEADING", "NAME", "QTY", "PRICE", "LTP", "DATE", "XIRR", "INVESTED"]):
                            symbol = val
                            break
                            
            if not symbol or len(symbol) < 2 or "TOTAL" in symbol or "%" in symbol:
                errors.append(f"Row {i+2}: Missing symbol data (or skipped summary row)")
                failed += 1
                continue

            # Extract quantity
            qty_col = col_map.get("quantity")
            quantity = _parse_float(str(row.get(qty_col, "0")) if qty_col and qty_col in row else "0")
            
            # Extract invested amount (cost)
            amount_col = col_map.get("invested_amount")
            invested_amount = _parse_float(str(row.get(amount_col, "0")) if amount_col and amount_col in row else "0")

            # Extract avg price
            price_col = col_map.get("avg_price")
            avg_price = _parse_float(str(row.get(price_col, "0")) if price_col and price_col in row else "0")
            
            # Logic for MF quantity: Total Amount / AVG NAV
            if quantity <= 0:
                if invested_amount > 0 and avg_price > 0:
                    quantity = round(invested_amount / avg_price, 3)
                else:
                    quantity = 1.0
            
            if avg_price <= 0:
                cp_col = col_map.get("current_price")
                if cp_col and cp_col in row:
                    avg_price = _parse_float(str(row.get(cp_col, "0")))
            
            # Fetch live data if we need name or price
            if symbol not in symbol_data_cache:
                info = await fetch_holding_info(symbol)
                symbol_data_cache[symbol] = info
            
            live_info = symbol_data_cache[symbol]

            if avg_price <= 0:
                if live_info and live_info.get("price", 0) > 0:
                    avg_price = live_info["price"]
                else:
                    stock_info = DEMO_STOCKS.get(symbol, (symbol, "Other", 100.0))
                    avg_price = stock_info[2] if len(stock_info) > 2 else 100.0

            # Extract optional fields
            name_col = col_map.get("name")
            name = str(row.get(name_col, "")).strip() if name_col and name_col in row else ""
            if not name:
                name = live_info.get("name") or DEMO_STOCKS.get(symbol, (symbol, "Other", avg_price))[0]

            broker_col = col_map.get("broker")
            broker = str(row.get(broker_col, "CSV Import")).strip() if broker_col and broker_col in row else "CSV Import"
            broker = broker or "CSV Import"

            date_col = col_map.get("buy_date")
            buy_date_str = str(row.get(date_col, "")).strip() if date_col and date_col in row else ""

            cp_col = col_map.get("current_price")
            current_price_val = _parse_float(str(row.get(cp_col, "0")) if cp_col and cp_col in row else "0")

            asset_col = col_map.get("asset_type")
            asset_type_val = str(row.get(asset_col, "")).strip().lower() if asset_col and asset_col in row else ""
            
            xirr_col = col_map.get("xirr")
            imported_xirr = _parse_float(str(row.get(xirr_col, "0"))) if xirr_col and xirr_col in row else None
            
            # Auto-detection logic for asset type
            if asset_type_val in ("mf", "mutual fund", "mutual_fund", "fund"):
                asset_type_val = "mutual_fund"
            elif not asset_type_val:
                # Infer from symbol or name
                combined_text = (symbol + " " + name).upper()
                is_mf = len(symbol) > 15 or any(k in combined_text for k in ["FUND", "GROWTH", "PLAN", "DIRECT", "REGULAR", "NAV", "LIQUID", "TAX", "CAP", "BOND"])
                asset_type_val = "mutual_fund" if is_mf else "stock"
            else:
                asset_type_val = "stock"

            sector = live_info.get("sector") or DEMO_STOCKS.get(symbol, ("", "Other"))[1]
            if current_price_val <= 0:
                current_price_val = live_info.get("price") or DEMO_STOCKS.get(symbol, ("", "", avg_price))[2]

            buy_date = _parse_date(buy_date_str) if buy_date_str else datetime.now()

            holding = Holding(
                user_id=current_user.id,
                symbol=symbol,
                name=name,
                asset_type=asset_type_val,
                quantity=quantity,
                avg_price=avg_price,
                current_price=current_price_val,
                broker=broker,
                sector=sector,
                imported_xirr=imported_xirr,
            )
            db.add(holding)
            db.flush()

            txn = Transaction(
                holding_id=holding.id,
                user_id=current_user.id,
                txn_type="buy",
                quantity=quantity,
                price=avg_price,
                date=buy_date,
            )
            db.add(txn)
            success += 1

        except Exception as e:
            errors.append(f"Row {i+2}: {str(e)}")
            failed += 1

    db.commit()
    return CSVUploadResult(success=success, failed=failed, errors=errors[:20])

