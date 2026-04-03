import sys
import os
from sqlalchemy import text

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.database import engine

def migrate():
    with engine.begin() as conn: # engine.begin() starts a transaction and commits automatically
        print("Starting Database Migration...")
        
        # Table: users
        print("  Checking table 'users'...")
        res_users = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")).fetchall()
        columns_users = [r[0].lower() for r in res_users]
        print(f"    Current columns: {columns_users}")
        
        if 'risk_appetite' not in columns_users:
            print("    Adding column 'risk_appetite' to 'users'...")
            conn.execute(text("ALTER TABLE users ADD COLUMN risk_appetite VARCHAR DEFAULT 'moderate'"))
        
        if 'reset_token' not in columns_users:
            print("    Adding column 'reset_token' to 'users'...")
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR"))

        if 'reset_token_expiry' not in columns_users:
            print("    Adding column 'reset_token_expiry' to 'users'...")
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP"))

        # Table: holdings
        print("  Checking table 'holdings'...")
        res_holdings = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'holdings'")).fetchall()
        columns_holdings = [r[0].lower() for r in res_holdings]
        print(f"    Current columns: {columns_holdings}")
        
        if 'asset_type' not in columns_holdings:
            print("    Adding column 'asset_type' to 'holdings'...")
            conn.execute(text("ALTER TABLE holdings ADD COLUMN asset_type VARCHAR DEFAULT 'stock'"))
            
        print("Database Migration SUCCESS.")

if __name__ == "__main__":
    migrate()
