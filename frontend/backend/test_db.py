from sqlalchemy import create_engine, text

DATABASE_URL = (
    "postgresql+psycopg2://"
    "structure_guard:structure_guard_dev@127.0.0.1:5433/structure_guard"
)
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT current_database(), current_user;"))
        print("DATABASE CONNECTION SUCCESS")
        print(result.fetchone())

except Exception as e:
    print("DATABASE CONNECTION FAILED")
    print(type(e).__name__)
    print(e)