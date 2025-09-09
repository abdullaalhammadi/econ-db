import os
from structure import engine, users, indicators
from sqlalchemy import select

print("=== Oracle Environment Variables ===")
oracle_vars = ['ORACLE_HOST', 'ORACLE_PORT', 'ORACLE_SERVICE_NAME', 'ORACLE_USERNAME', 'ORACLE_PASSWORD']
for var in oracle_vars:
    value = os.environ.get(var, 'NOT SET')
    print(f"{var}: {value}")

print(f"\n=== Connection String ===")
print(f"Engine URL: {engine.url}")

print(f"\n=== Database Connection Test ===")
try:
    with engine.connect() as conn:
        print("✓ Database connection successful")
        result = conn.execute(select(users))
        users_data = result.fetchall()
        print(f"Users table data: {users_data}")
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    print(f"Error type: {type(e).__name__}")