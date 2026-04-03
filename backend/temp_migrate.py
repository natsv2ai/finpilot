from app.db.database import engine
from sqlalchemy import text

def migrate():
    print("Starting migration...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE assets ADD COLUMN property_details VARCHAR DEFAULT '';"))
            conn.commit()
            print("Successfully added property_details column.")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("Column already exists.")
            else:
                print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
