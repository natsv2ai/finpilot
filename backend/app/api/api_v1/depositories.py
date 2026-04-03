"""Depository (NSDL/CDSL) API endpoints — CAS PDF upload and parsing."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.holding import Holding, Transaction
from app.services.depositories.cas_parser import parse_cas_pdf
from app.utils.constants import DEMO_STOCKS


router = APIRouter(prefix="/depositories", tags=["Depository (NSDL/CDSL)"])


class CASUploadResult(BaseModel):
    source: str
    holdings_found: int
    imported: int
    skipped: int
    errors: list[str]


@router.post("/upload-cas", response_model=CASUploadResult)
async def upload_cas_pdf(
    file: UploadFile = File(...),
    password: str = Form(default=""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a NSDL/CDSL CAS (Consolidated Account Statement) PDF.
    
    How to get your CAS:
    - NSDL: https://nsdl.co.in → CAS → Request Statement
    - CDSL: https://www.cdslindia.com → My Easi → CAS
    
    Password is usually: PAN + DOB (e.g., ABCDE1234F01-Jan-1990)
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()

    try:
        cas_holdings = parse_cas_pdf(content, password=password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    source = cas_holdings[0].source if cas_holdings else "Unknown"
    imported = 0
    skipped = 0
    errors: list[str] = []

    for h in cas_holdings:
        try:
            # Try to find current price from demo data using ISIN or name
            symbol = h.isin or h.name[:10].upper().replace(" ", "")
            stock_info = DEMO_STOCKS.get(symbol, (h.name, "Other", 0))
            current_price = h.current_value / h.quantity if h.quantity > 0 and h.current_value > 0 else (stock_info[2] if len(stock_info) > 2 else 0)
            avg_price = current_price  # CAS doesn't always have buy price

            holding = Holding(
                user_id=current_user.id,
                symbol=symbol,
                name=h.name,
                asset_type=h.asset_type,
                quantity=h.quantity,
                avg_price=avg_price,
                current_price=current_price,
                broker=f"{h.source}-depository",
                sector=stock_info[1] if len(stock_info) > 1 else "Other",
            )
            db.add(holding)
            db.flush()

            txn = Transaction(
                holding_id=holding.id,
                user_id=current_user.id,
                txn_type="buy",
                quantity=h.quantity,
                price=avg_price,
                date=datetime.now(),
            )
            db.add(txn)
            imported += 1

        except Exception as e:
            errors.append(f"{h.name}: {str(e)}")
            skipped += 1

    db.commit()

    return CASUploadResult(
        source=source,
        holdings_found=len(cas_holdings),
        imported=imported,
        skipped=skipped,
        errors=errors[:10],
    )


@router.get("/info")
def get_depository_info():
    """Information about supported depository integrations."""
    return {
        "supported": [
            {
                "name": "NSDL",
                "method": "CAS PDF Upload",
                "instructions": [
                    "Visit https://nsdl.co.in",
                    "Login with your PAN and password",
                    "Go to CAS → Request Statement",
                    "Download the PDF",
                    "Upload it here with your password (PAN+DOB)",
                ],
            },
            {
                "name": "CDSL",
                "method": "CAS PDF Upload",
                "instructions": [
                    "Visit https://www.cdslindia.com",
                    "Login to My Easi / Easiest",
                    "Go to Consolidated Account Statement",
                    "Download the PDF",
                    "Upload it here with your password (PAN+DOB)",
                ],
            },
        ],
    }
