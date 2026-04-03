import asyncio
from app.main import app

async def check():
    try:
        async with app.router.lifespan_context(app):
            pass
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(check())
