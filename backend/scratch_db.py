from app.database.db import engine
from sqlalchemy import text
with engine.begin() as conn:
    try:
        conn.execute(text("ALTER TABLE jobs ADD COLUMN modality VARCHAR;"))
        print("Column added")
    except Exception as e:
        print(e)
