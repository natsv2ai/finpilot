import sys
import os
import re

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.holding import Holding
# Note: fetch_live_price is async, we'll run it in a small event loop if needed
# but for now let's focus on DB cleanup.

def cleanup_sync():
    db = SessionLocal()
    try:
        user_id = 2 # Nagaraju
        print(f"Cleanup for User {user_id}...")
        
        holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
        
        mf_keywords = ["FUND", "GROWTH", "NAV", "PLAN", "DIRECT", "REGULAR", "KOTAK", "PARAG", "QUANT", "ICICI", "SBI", "HDFC"]
        
        seen = {} # symbol -> id
        to_delete = []
        
        for h in holdings:
            sym = h.symbol.strip().upper()
            name = (h.name or "").upper()
            
            # Asset type re-check
            is_mf = len(sym) > 15 or any(k in sym for k in mf_keywords) or any(k in name for k in mf_keywords)
            h.asset_type = "mutual_fund" if is_mf else "stock"
            
            # De-duplication
            if sym in seen:
                print(f"  [DUP] {sym} (ID {h.id})")
                to_delete.append(h.id)
            else:
                seen[sym] = h.id
                
        if to_delete:
            print(f"Deleting {len(to_delete)} duplicates...")
            db.query(Holding).filter(Holding.id.in_(to_delete)).delete(synchronize_session=False)
            
        db.commit()
        print("Portfolio Cleanup SUCCESS.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_sync()
