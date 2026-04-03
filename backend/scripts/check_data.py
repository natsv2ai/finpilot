import sys
import os

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.holding import Holding

def check_data():
    db = SessionLocal()
    try:
        holdings = db.query(Holding).all()
        print(f"Total Holdings: {len(holdings)}")
        for h in holdings:
            print(f"ID: {h.id}, Symbol: {h.symbol}, AssetType: {h.asset_type}, Qty: {h.quantity}, Avg: {h.avg_price}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
