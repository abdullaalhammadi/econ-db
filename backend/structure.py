from sqlalchemy import (
    create_engine, MetaData, Table, Column,
    String, Integer, DateTime, Text, PrimaryKeyConstraint
)

engine = create_engine("sqlite:///structure.db")
metadata_obj = MetaData()

indicators = Table(
    "indicators", metadata_obj,
    Column("indicator_id", String),
    Column("version_number", Integer),
    Column("indicator_name_en", String),
    Column("indicator_name_ar", String),
    Column("added_by", String),
    Column("qc_by", String),
    Column("added_date", DateTime),
    Column("notes", Text),
    Column("data", Text),  # JSON string of the uploaded data
    PrimaryKeyConstraint("indicator_id", "version_number")
)

users = Table(
    "users", metadata_obj,
    Column("id", Integer, primary_key=True),
    Column("username", String, unique=True, nullable=False),
    Column("password", String, nullable=False)
)

metadata_obj.create_all(engine)

if __name__ == '__main__':
    with engine.connect() as conn:
        print("Database and table created successfully.")
        conn.commit()