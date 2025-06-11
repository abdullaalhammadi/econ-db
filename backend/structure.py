from sqlalchemy import create_engine, MetaData, Table, Column, String, Integer, DateTime, Text, func

engine = create_engine("sqlite:///structure.db")
metadata_obj = MetaData()

indicators = Table(
    "indicators", metadata_obj,
    Column("indicator_id", String, primary_key=True),
    Column("version_number", Integer, primary_key=True, autoincrement=False),
    Column("indicator_name_en", String),
    Column("indicator_name_ar", String),
    Column("added_by", String),
    Column("qc_by", String),
    Column("added_date", DateTime),
    Column("notes", Text),
    Column("data", Text)  # JSON string of the uploaded data
)

metadata_obj.create_all(engine)