import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy import select, insert
from structure import users, roles, engine
from services.ldap_auth import ldap_service, LDAPConnectionError

auth_bp = Blueprint('auth', __name__)


def get_or_create_user(ad_user_info: dict) -> tuple:
    """
    Get existing user or create new user from AD authentication.

    Returns:
        tuple: (user_id, is_new_user)
    """
    username = ad_user_info['username']

    with engine.connect() as conn:
        # Check if user exists
        stmt = select(users).where(users.c.username == username)
        res = conn.execute(stmt)
        existing_user = res.first()

        if existing_user:
            return existing_user.id, False

        # Auto-provision new user
        # Password field set to placeholder (AD validates credentials)
        insert_user_stmt = insert(users).values(
            username=username,
            password='AD_AUTHENTICATED'
        )
        result = conn.execute(insert_user_stmt)
        user_id = result.inserted_primary_key[0]

        # Insert default 'standard' role
        insert_role_stmt = insert(roles).values(
            id=user_id,
            username=username,
            role='standard'
        )
        conn.execute(insert_role_stmt)
        conn.commit()

        return user_id, True


@auth_bp.route('/login', methods=['POST'])
def login():
    from endpoints import User  # Import User class from main file

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        # Authenticate against Active Directory
        ad_user = ldap_service.authenticate(username, password)

        if ad_user is None:
            return jsonify({'error': 'Invalid username or password'}), 401

        # Get or create local user record
        user_id, is_new_user = get_or_create_user(ad_user)

        # Create Flask-Login user and log in
        user = User(id=user_id, username=ad_user['username'])
        login_user(user)

        response_data = {'message': 'Logged in successfully'}
        if is_new_user:
            response_data['info'] = 'Account created on first login'

        return jsonify(response_data)

    except LDAPConnectionError as e:
        print(f"LDAP Connection Error: {e}")
        return jsonify({'error': 'Authentication service unavailable. Please try again later.'}), 503


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Registration is disabled - users are managed through Active Directory.
    """
    return jsonify({
        'error': 'Self-registration is disabled. Please contact your IT administrator for account access.'
    }), 403


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
