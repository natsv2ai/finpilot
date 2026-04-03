from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.broker_connection import BrokerConnection
from app.models.holding import Holding, Transaction
from app.services.brokers.broker_registry import list_brokers as list_registered_brokers

router = APIRouter(prefix="/brokers", tags=["Broker Connectors"])


@router.get("/available")
def get_available_brokers():
    """List all registered broker integrations (dynamic, plugin-based)."""
    return list_registered_brokers()



class BrokerStatus(BaseModel):
    broker_name: str
    status: str
    last_synced: str | None = None

    class Config:
        from_attributes = True


class BrokerAuthUrlResponse(BaseModel):
    auth_url: str
    broker: str


class BrokerCallbackRequest(BaseModel):
    code: str


# ── Broker OAuth2 URLs ──

BROKER_AUTH_URLS = {
    "upstox": "https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id={api_key}&redirect_uri={redirect_uri}",
    "zerodha": "https://kite.zerodha.com/connect/login?v=3&api_key={api_key}",
    "groww": "https://groww.in/oauth/connect?client_id={api_key}&redirect_uri={redirect_uri}",
    "angelone": None,  # Angel One uses TOTP, no OAuth2 redirect
}


@router.get("/status", response_model=list[BrokerStatus])
def get_broker_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all broker connections for the user."""
    connections = db.query(BrokerConnection).filter(
        BrokerConnection.user_id == current_user.id
    ).all()

    result = []
    for conn in connections:
        result.append(BrokerStatus(
            broker_name=conn.broker_name,
            status=conn.status,
            last_synced=conn.last_synced.isoformat() if conn.last_synced else None,
        ))
    return result


@router.get("/connect/{broker}", response_model=BrokerAuthUrlResponse)
def get_connect_url(
    broker: str,
    current_user: User = Depends(get_current_user),
):
    """Get OAuth2 authorization URL for a broker."""
    broker = broker.lower()
    if broker not in BROKER_AUTH_URLS:
        raise HTTPException(status_code=400, detail=f"Unsupported broker: {broker}")

    if broker == "upstox":
        if not settings.UPSTOX_API_KEY:
            raise HTTPException(status_code=400, detail="Upstox API key not configured")
        auth_url = BROKER_AUTH_URLS["upstox"].format(
            api_key=settings.UPSTOX_API_KEY,
            redirect_uri=settings.FRONTEND_URL + "/settings?broker_callback=upstox",
        )
    elif broker == "zerodha":
        if not settings.ZERODHA_API_KEY:
            raise HTTPException(status_code=400, detail="Zerodha API key not configured")
        auth_url = BROKER_AUTH_URLS["zerodha"].format(api_key=settings.ZERODHA_API_KEY)
    elif broker == "groww":
        if not settings.GROWW_API_KEY:
            raise HTTPException(status_code=400, detail="Groww API key not configured")
        auth_url = BROKER_AUTH_URLS["groww"].format(
            api_key=settings.GROWW_API_KEY,
            redirect_uri=settings.FRONTEND_URL + "/settings?broker_callback=groww",
        )
    elif broker == "angelone":
        raise HTTPException(status_code=400, detail="Angel One uses TOTP login — use /brokers/connect-angelone endpoint")
    else:
        raise HTTPException(status_code=400, detail="Unsupported broker")

    return BrokerAuthUrlResponse(auth_url=auth_url, broker=broker)


@router.post("/callback/{broker}")
async def handle_callback(
    broker: str,
    payload: BrokerCallbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Exchange OAuth2 authorization code for access token and store connection."""
    broker = broker.lower()

    if broker not in BROKER_AUTH_URLS:
        raise HTTPException(status_code=400, detail="Unsupported broker")

    from app.services.brokers.broker_base import BrokerConfig
    from app.services.brokers.broker_registry import get_broker
    
    # Intialize broker config
    broker_params = BrokerConfig(name=broker)
    if broker == "upstox":
        if not settings.UPSTOX_API_KEY:
            raise HTTPException(status_code=400, detail="Upstox API key not configured")
        broker_params.api_key = settings.UPSTOX_API_KEY
        broker_params.api_secret = settings.UPSTOX_API_SECRET
        broker_params.redirect_uri = settings.FRONTEND_URL + f"/settings?broker_callback={broker}"
    elif broker == "groww":
        if not settings.GROWW_API_KEY:
            raise HTTPException(status_code=400, detail="Groww API key not configured")
        broker_params.api_key = settings.GROWW_API_KEY
        broker_params.api_secret = settings.GROWW_API_SECRET
        broker_params.redirect_uri = settings.FRONTEND_URL + f"/settings?broker_callback={broker}"
    elif broker == "zerodha":
        broker_params.api_key = settings.ZERODHA_API_KEY
        broker_params.api_secret = settings.ZERODHA_API_SECRET
    
    broker_instance = get_broker(broker, broker_params)

    try:
        access_token = await broker_instance.exchange_token(payload.code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to exchange token: {str(e)}")

    # Upsert broker connection
    existing = db.query(BrokerConnection).filter(
        BrokerConnection.user_id == current_user.id,
        BrokerConnection.broker_name == broker,
    ).first()

    if existing:
        existing.access_token = access_token
        existing.status = "connected"
        existing.last_synced = None
    else:
        conn = BrokerConnection(
            user_id=current_user.id,
            broker_name=broker,
            access_token=access_token,
            status="connected",
        )
        db.add(conn)

    db.commit()
    return {"message": f"Connected to {broker}", "status": "connected"}


@router.post("/sync/{broker}")
async def sync_holdings(
    broker: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch holdings from broker and upsert into holdings table."""
    broker = broker.lower()

    conn = db.query(BrokerConnection).filter(
        BrokerConnection.user_id == current_user.id,
        BrokerConnection.broker_name == broker,
    ).first()

    if not conn or conn.status != "connected":
        raise HTTPException(status_code=400, detail=f"Not connected to {broker}")

    from app.services.brokers.broker_base import BrokerConfig
    from app.services.brokers.broker_registry import get_broker
    from app.models.holding import Holding
    from app.models.holding import Transaction
    
    broker_params = BrokerConfig(name=broker)
    if broker == "upstox":
        broker_params.api_key = settings.UPSTOX_API_KEY
        broker_params.api_secret = settings.UPSTOX_API_SECRET
        broker_params.redirect_uri = settings.FRONTEND_URL + f"/settings?broker_callback={broker}"
    elif broker == "groww":
        broker_params.api_key = settings.GROWW_API_KEY
        broker_params.api_secret = settings.GROWW_API_SECRET
        broker_params.redirect_uri = settings.FRONTEND_URL + f"/settings?broker_callback={broker}"
    elif broker == "zerodha":
        broker_params.api_key = settings.ZERODHA_API_KEY
        broker_params.api_secret = settings.ZERODHA_API_SECRET

    broker_instance = get_broker(broker, broker_params)
    broker_instance.set_access_token(conn.access_token)

    try:
        broker_holdings = await broker_instance.get_holdings()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch holdings from {broker}: {str(e)}")

    # Upsert holdings
    for bh in broker_holdings:
        # Identify symbol
        sym = bh.symbol if bh.symbol else bh.name[:15].upper().replace(" ", "")
        if not sym:
            continue
            
        h = db.query(Holding).filter(
            Holding.user_id == current_user.id,
            Holding.symbol == sym,
            Holding.broker == broker,
        ).first()

        if h:
            # Update existing holding
            h.quantity = bh.quantity
            h.avg_price = bh.avg_price
            h.current_price = bh.current_price
            h.name = bh.name
        else:
            # Create new holding
            new_h = Holding(
                user_id=current_user.id,
                symbol=sym,
                name=bh.name,
                asset_type="stock" if not any(k in bh.name.upper() for k in ["FUND", "GROWTH", "DIRECT", "REGULAR", "PLAN"]) else "mutual_fund",
                quantity=bh.quantity,
                avg_price=bh.avg_price,
                current_price=bh.current_price,
                broker=broker,
                sector="Other"
            )
            db.add(new_h)
            db.flush()
            
            # Initial buy transaction to establish baseline
            txn = Transaction(
                holding_id=new_h.id,
                user_id=current_user.id,
                txn_type="buy",
                quantity=bh.quantity,
                price=bh.avg_price,
                date=datetime.now(timezone.utc),
            )
            db.add(txn)

    conn.last_synced = datetime.now(timezone.utc)
    db.commit()

    return {
        "message": f"Holdings synced from {broker}",
        "last_synced": conn.last_synced.isoformat(),
        "count": len(broker_holdings)
    }


@router.delete("/disconnect/{broker}")
def disconnect_broker(
    broker: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Disconnect a broker and remove stored tokens."""
    conn = db.query(BrokerConnection).filter(
        BrokerConnection.user_id == current_user.id,
        BrokerConnection.broker_name == broker.lower(),
    ).first()

    if not conn:
        raise HTTPException(status_code=404, detail="Broker connection not found")

    db.delete(conn)
    db.commit()
    return {"message": f"Disconnected from {broker}"}
