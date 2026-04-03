from fastapi import APIRouter

from app.api.api_v1.auth import router as auth_router
from app.api.api_v1.holdings import router as holdings_router
from app.api.api_v1.portfolios import router as portfolios_router
from app.api.api_v1.insights import router as insights_router
from app.api.api_v1.watchlist import router as watchlist_router
from app.api.api_v1.users import router as users_router
from app.api.api_v1.insurance import router as insurance_router
from app.api.api_v1.expenses import router as expenses_router
from app.api.api_v1.family import router as family_router
from app.api.api_v1.assets import router as assets_router
from app.api.api_v1.networth import router as networth_router
from app.api.api_v1.brokers import router as brokers_router
from app.api.api_v1.market import router as market_router
from app.api.api_v1.ai import router as ai_router
from app.api.api_v1.depositories import router as depository_router
from app.api.api_v1.mcp_router import router as mcp_router
from app.api.api_v1.ipos import router as ipo_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(holdings_router)
api_router.include_router(portfolios_router)
api_router.include_router(insights_router)
api_router.include_router(watchlist_router)
api_router.include_router(users_router)
api_router.include_router(insurance_router)
api_router.include_router(expenses_router)
api_router.include_router(family_router)
api_router.include_router(assets_router)
api_router.include_router(networth_router)
api_router.include_router(brokers_router)
api_router.include_router(market_router)
api_router.include_router(ai_router)
api_router.include_router(depository_router)
api_router.include_router(mcp_router)
api_router.include_router(ipo_router)


