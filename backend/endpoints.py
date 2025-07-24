from sqlalchemy import create_engine, select, insert, update, delete, desc, func
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from structure import indicators, users
import json
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'super secret key'  # Change this!
CORS(app, supports_credentials=True)  # Enable CORS for frontend connection
engine = create_engine("sqlite:///structure.db")

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin):
    def __init__(self, id, username):
        self.id = id
        self.username = username

@login_manager.user_loader
def load_user(user_id):
    with engine.connect() as conn:
        stmt = select(users).where(users.c.id == user_id)
        res = conn.execute(stmt)
        user = res.first()
        if user:
            return User(id=user.id, username=user.username)
        return None

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    with engine.connect() as conn:
        # Check if user already exists
        stmt = select(users).where(users.c.username == username)
        res = conn.execute(stmt)
        if res.first():
            return jsonify({'error': 'Username already exists'}), 400

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        
        insert_stmt = insert(users).values(
            username=username,
            password=hashed_password
        )
        conn.execute(insert_stmt)
        conn.commit()

        return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    with engine.connect() as conn:
        stmt = select(users).where(users.c.username == username)
        res = conn.execute(stmt)
        user_data = res.first()

        if user_data and check_password_hash(user_data.password, password):
            user = User(id=user_data.id, username=user_data.username)
            login_user(user)
            return jsonify({'message': 'Logged in successfully'})
        
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@app.route('/status', methods=['GET'])
def status():
    if current_user.is_authenticated:
        return jsonify({'logged_in': True, 'user': {'username': current_user.username}})
    return jsonify({'logged_in': False})


@app.route('/indicators', methods=['GET'])
def get_indicators():
    """Get all indicators with their latest versions"""
    with engine.connect() as conn:
        # Get the latest version of each indicator
        subquery = select(
            indicators.c.indicator_id,
            func.max(indicators.c.version_number).label('max_version')
        ).group_by(indicators.c.indicator_id).subquery()
        
        stmt = select(indicators).join(
            subquery,
            (indicators.c.indicator_id == subquery.c.indicator_id) &
            (indicators.c.version_number == subquery.c.max_version)
        ).order_by(desc(indicators.c.added_date))
        
        res = conn.execute(stmt)
        rows = res.mappings().all()
        
        # Convert to frontend format
        datasets = []
        for row in rows:
            dataset = {
                'indicator_id': row['indicator_id'],
                'indicator_name_en': row['indicator_name_en'],
                'indicator_name_ar': row['indicator_name_ar'],
                'added_by': row['added_by'],
                'qc_by': row['qc_by'],
                'added_date': row['added_date'].isoformat() if row['added_date'] else '',
                'notes': row['notes'],
                'version': row['version_number'],
                'created_at': row['added_date'].isoformat() if row['added_date'] else '',
                'updated_at': row['added_date'].isoformat() if row['added_date'] else '',
                'uploadedData': json.loads(row['data']) if row['data'] else []
            }
            datasets.append(dataset)
        
        return jsonify(datasets)

@app.route('/indicators/<string:indicator_id>/data', methods=['GET'])
def get_data(indicator_id):
    """Get data for a specific indicator (latest version)"""
    with engine.connect() as conn:
        stmt = select(indicators.c.data).where(
            indicators.c.indicator_id == indicator_id
        ).order_by(desc(indicators.c.version_number)).limit(1)
        
        res = conn.execute(stmt)
        data = res.scalar()
        
        if data:
            return jsonify(json.loads(data))
        else:
            return jsonify([])

@app.route('/indicators/<string:indicator_id>/versions', methods=['GET'])
def get_indicator_versions(indicator_id):
    """Get all versions of a specific indicator"""
    with engine.connect() as conn:
        stmt = select(indicators).where(
            indicators.c.indicator_id == indicator_id
        ).order_by(desc(indicators.c.version_number))
        
        res = conn.execute(stmt)
        rows = res.mappings().all()
        
        versions = []
        for row in rows:
            version = {
                'version': row['version_number'],
                'indicator_id': row['indicator_id'],
                'indicator_name_en': row['indicator_name_en'],
                'indicator_name_ar': row['indicator_name_ar'],
                'added_by': row['added_by'],
                'qc_by': row['qc_by'],
                'added_date': row['added_date'].isoformat() if row['added_date'] else '',
                'notes': row['notes'],
                'created_at': row['added_date'].isoformat() if row['added_date'] else '',
                'updated_at': row['added_date'].isoformat() if row['added_date'] else '',
                'uploadedData': json.loads(row['data']) if row['data'] else []
            }
            versions.append(version)
        
        return jsonify(versions)

@app.route('/indicators/<string:indicator_id>/versions/<int:version>', methods=['GET'])
def get_indicator_version(indicator_id, version):
    """Get a specific version of an indicator"""
    with engine.connect() as conn:
        stmt = select(indicators).where(
            (indicators.c.indicator_id == indicator_id) &
            (indicators.c.version_number == version)
        )
        
        res = conn.execute(stmt)
        row = res.mappings().first()
        
        if row:
            dataset = {
                'indicator_id': row['indicator_id'],
                'indicator_name_en': row['indicator_name_en'],
                'indicator_name_ar': row['indicator_name_ar'],
                'added_by': row['added_by'],
                'qc_by': row['qc_by'],
                'added_date': row['added_date'].isoformat() if row['added_date'] else '',
                'notes': row['notes'],
                'version': row['version_number'],
                'created_at': row['added_date'].isoformat() if row['added_date'] else '',
                'updated_at': row['added_date'].isoformat() if row['added_date'] else '',
                'uploadedData': json.loads(row['data']) if row['data'] else []
            }
            return jsonify(dataset)
        else:
            return jsonify({'error': 'Version not found'}), 404

@app.route('/indicators/<string:indicator_id>/versions/<int:version>/data', methods=['GET'])
def get_indicator_version_data(indicator_id, version):
    """Get only the uploadedData for a specific version of an indicator"""
    with engine.connect() as conn:
        stmt = select(indicators.c.data).where(
            (indicators.c.indicator_id == indicator_id) &
            (indicators.c.version_number == version)
        )

        res = conn.execute(stmt)
        row = res.first()

        if row and row.data:
            try:
                return jsonify(json.loads(row.data))
            except json.JSONDecodeError:
                return jsonify({'error': 'Invalid JSON format in data field'}), 500
        else:
            return jsonify([])  # Return empty array if no data or version not found


@app.route('/indicators', methods=['POST'])
@login_required
def create_indicator():
    """Create a new indicator or add a new version"""
    data = request.get_json()
    
    with engine.connect() as conn:
        # Check if indicator already exists
        existing_stmt = select(indicators.c.version_number).where(
            indicators.c.indicator_id == data['indicator_id']
        ).order_by(desc(indicators.c.version_number)).limit(1)
        
        existing_result = conn.execute(existing_stmt)
        existing_version = existing_result.scalar()
        
        # Determine new version number
        new_version = (existing_version + 1) if existing_version else 1
        
        # Insert new record
        insert_stmt = insert(indicators).values(
            indicator_id=data['indicator_id'],
            version_number=new_version,
            indicator_name_en=data['indicator_name_en'],
            indicator_name_ar=data['indicator_name_ar'],
            added_by=current_user.username,
            qc_by=data['qc_by'],
            added_date=datetime.fromisoformat(data['added_date']),
            notes=data['notes'],
            data=json.dumps(data['uploadedData'])
        )
        
        conn.execute(insert_stmt)
        conn.commit()
        
        return jsonify({
            'message': 'Indicator saved successfully',
            'version': new_version,
            'is_new_version': existing_version is not None
        })

@app.route('/indicators/<string:indicator_id>', methods=['DELETE'])
@login_required
def delete_indicator(indicator_id):
    """Delete all versions of an indicator"""
    with engine.connect() as conn:
        stmt = delete(indicators).where(indicators.c.indicator_id == indicator_id)
        result = conn.execute(stmt)
        conn.commit()
        
        if result.rowcount > 0:
            return jsonify({'message': 'Indicator deleted successfully'})
        else:
            return jsonify({'error': 'Indicator not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
