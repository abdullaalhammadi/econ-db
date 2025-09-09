from structure import engine, users, indicators
from sqlalchemy import select

with engine.connect() as conn:
    result = conn.execute(select(users))
    users_data = result.fetchall()
    print(users_data)

    