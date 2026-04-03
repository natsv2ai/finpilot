import sys
import os

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.holding import Holding

def fix_mutual_funds():
    db = SessionLocal()
    try:
        # 1. Fetch all holdings that are currently marked as 'stock'
        holdings = db.query(Holding).filter(Holding.asset_type == "stock").all()
        
        mf_keywords = ["FUND", "GROWTH", "NAV", "PLAN", "INF209", "INF174", "INF179"]
        updated_count = 0
        correction_count = 0
        
        print(f"Scanning {len(holdings)} holdings for Mutual Fund patterns...")
        
        for holding in holdings:
            is_mf = False
            search_text = (holding.symbol + " " + (holding.name or "")).upper()
            
            # Check for MF keywords
            if any(kw in search_text for kw in mf_keywords):
                is_mf = True
            
            # Additional heuristic: MF symbols are often long ISINs or have many dots/spaces
            if len(holding.symbol) > 15:
                is_mf = True
                
            if is_mf:
                print(f"Found MF: {holding.symbol} - {holding.name}")
                holding.asset_type = "mutual_fund"
                updated_count += 1
                
                # Correction Logic:
                # If quantity is very high (e.g., > 1000) and avg_price is reasonable (e.g., > 5),
                # it's likely the user's spreadsheet had "Amount Invested" in the Quantity column.
                if holding.quantity > 500 and holding.avg_price > 5:
                    old_qty = holding.quantity
                    new_qty = holding.quantity / holding.avg_price
                    print(f"  --> Correcting Quantity: {old_qty:.2f} (Amount) -> {new_qty:.4f} (Units)")
                    holding.quantity = new_qty
                    correction_count += 1
        
        db.commit()
        print(f"\nSUCCESS: Updated {updated_count} records to 'mutual_fund'.")
        print(f"SUCCESS: Corrected {correction_count} 'Quantity' values.")
        
    except Exception as e:
        print(f"Error during update: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_mutual_funds()
