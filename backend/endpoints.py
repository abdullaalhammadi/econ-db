from sqlalchemy import create_engine, select
from flask import Flask
from structure import indicators
import json

app = Flask(__name__)
engine = create_engine("sqlite:///structure.db")

@app.route('/indicators')
def get_indicators():
    with engine.connect() as conn:
        stmt = select(indicators)
        res = conn.execute(stmt)
        rows = res.mappings().all()
        return json.dumps([dict(row) for row in rows], default=str), 200

@app.route('/indicators/<string:indicator>/data')
def get_data(indicator):
    with engine.connect() as conn:
        stmt = select(indicators.c.data).where(indicators.c.indicator_id == indicator)
        res = conn.execute(stmt)
        return json.loads(res.scalar()), 200