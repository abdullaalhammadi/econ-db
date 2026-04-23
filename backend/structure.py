import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine, MetaData, Table, Column,
    String, Integer, DateTime, Text, PrimaryKeyConstraint
)

# Load environment variables from .env file
load_dotenv()

# SQL Server DB connection configuration from environment variables
SQLSERVER_HOST = os.getenv("SQLSERVER_HOST")
SQLSERVER_PORT = os.getenv("SQLSERVER_PORT")
SQLSERVER_DATABASE = os.getenv("SQLSERVER_DATABASE")
SQLSERVER_USERNAME = os.getenv("SQLSERVER_USERNAME")
SQLSERVER_PASSWORD = os.getenv("SQLSERVER_PASSWORD")

# SQL Server connection string
# Using pymssql driver (alternative: pyodbc)
params = quote_plus(
    "DRIVER=ODBC Driver 18 for SQL Server;"
    f"SERVER={SQLSERVER_HOST},{SQLSERVER_PORT};"
    f"DATABASE={SQLSERVER_DATABASE};"
    f"UID={SQLSERVER_USERNAME};"
    f"PWD={SQLSERVER_PASSWORD};"
    "TrustServerCertificate=yes;"
)
engine_url = f"mssql+pyodbc:///?odbc_connect={params}"
engine = create_engine(engine_url)
metadata_obj = MetaData()


indicators = Table(
    "indicators", metadata_obj,
    Column("indicator_id", String(255)),
    Column("version_number", Integer),
    Column("indicator_name_en", String(255)),
    Column("indicator_name_ar", String(255)),
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
    schema="app_dev"
)

users = Table(
    "users", metadata_obj,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("username", String(255), unique=True, nullable=False),
    Column("password", String(255), nullable=False),
    schema="app_dev"
)

roles = Table(
    "roles", metadata_obj,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("username", String(255), nullable=False),
    Column("role", String(255), nullable=False),
    schema="app_dev"
)

audit_logs = Table(
    "audit_logs", metadata_obj,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("event_time", DateTime, nullable=False),
    Column("admin_user", String(255), nullable=False),
    Column("action_type", String(100), nullable=False),
    Column("target_user", String(255)),
    Column("target_indicator", String(255)),
    Column("old_value", String(255)),
    Column("new_value", String(255)),
    Column("details", Text),
    schema="app_dev"
)

metadata_obj.create_all(engine)

if __name__ == '__main__':
    with engine.connect() as conn:
        print("Database and table created successfully.")
        conn.commit()