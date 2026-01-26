from flask import Blueprint, jsonify
from flask_login import current_user
from sqlalchemy import select
from structure import users, engine

utils_bp = Blueprint('utils', __name__)

@utils_bp.route('/test', methods=['GET'])
def test():
    return jsonify({
        'status': 'ok',
        'message': 'API is running',
        'user_authenticated': current_user.is_authenticated,
        'current_user': current_user.username if current_user.is_authenticated else None
    })

@utils_bp.route('/test/db', methods=['GET'])
def test_db():
    """Test database connection"""
    try:
        with engine.connect() as conn:
            # Select all from users table
            users_result = conn.execute(select(users))
            users_data = [dict(row._mapping) for row in users_result.fetchall()]
            
            return jsonify({
                'status': 'ok',
                'message': 'Database connection successful'
            }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Database connection failed',
            'error': str(e)
        }), 500