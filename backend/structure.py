import os
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine, MetaData, Table, Column,
    String, Integer, DateTime, Text, PrimaryKeyConstraint, Enum
)

# Load environment variables from .env file
load_dotenv()

# Oracle DB connection configuration from environment variables
ORACLE_HOST = os.getenv("ORACLE_HOST")
ORACLE_PORT = os.getenv("ORACLE_PORT")
ORACLE_SERVICE_NAME = os.getenv("ORACLE_SERVICE_NAME")
ORACLE_USERNAME = os.getenv("ORACLE_USERNAME")
ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD")

# Oracle connection string
oracle_connection_string = f"oracle+oracledb://{ORACLE_USERNAME}:{ORACLE_PASSWORD}@{ORACLE_HOST}:{ORACLE_PORT}/?service_name={ORACLE_SERVICE_NAME}"
engine = create_engine(oracle_connection_string)
metadata_obj = MetaData()


indicators = Table(
    "indicators", metadata_obj,
    Column("indicator_id", String(255)),  # Oracle requires explicit length for varchar
    Column("version_number", Integer),
    Column("indicator_name_en", String(500)),
    Column("indicator_name_ar", String(500)),
    Column("added_by", String(100)),
    Column("qc_by", String(100)),
    Column("added_date", DateTime),
    Column("notes", Text),
    Column("source", String(255)),
    Column("domain", String(255)),
    Column("data", Text),  # JSON string of the uploaded data
    Column("approval_status", String(50), default="Pending Review"),
    Column("approved_by", String(100)),
    Column("approval_date", DateTime),
    Column("rejection_reason", Text),
    PrimaryKeyConstraint("indicator_id", "version_number"),
    schema="APP_DEV"
)

users = Table(
    "users", metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("username", String(255), unique=True, nullable=False),
    Column("password", String(255), nullable=False),
    schema="APP_DEV"
)

roles = Table(
    "roles", metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("username", String(255), nullable=False),
    Column("role", String(255), nullable=False),
    schema="APP_DEV"
)

metadata_obj.create_all(engine)

if __name__ == '__main__':
    with engine.connect() as conn:
        print("Database and table created successfully.")
        conn.commit()