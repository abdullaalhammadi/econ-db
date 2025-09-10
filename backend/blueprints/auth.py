from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import select, insert
from structure import users, engine

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
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

@auth_bp.route('/login', methods=['POST'])
def login():
    from endpoints import User  # Import User class from main file
    
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

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@auth_bp.route('/status', methods=['GET'])
def status():
    if current_user.is_authenticated:
        return jsonify({'logged_in': True, 'user': {'username': current_user.username}})
    return jsonify({'logged_in': False})