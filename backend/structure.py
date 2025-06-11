from sqlalchemy import create_engine, MetaData, Table, Column, String, Integer, DateTime, Text

engine = create_engine("sqlite:///structure.db")
metadata_obj = MetaData()

indicators = Table(
    "indicators", metadata_obj,
    Column("indicator_id", String, primary_key=True),
    Column("version_number", Integer, autoincrement=True),
    Column("indicator_name_en", String),
    Column("indicator_name_ar", String),
    Column("added_by", String),
    Column("qc_by", String),
    Column("added_date", DateTime),
    Column("notes", Text),
    Column("data", Text)
)

metadata_obj.create_all(engine)