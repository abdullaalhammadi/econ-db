from sqlalchemy import select
from flask import Flask, jsonify
from flask_cors import CORS
from flask_login import LoginManager, UserMixin
from structure import users, roles, engine

# Import blueprints
from blueprints.auth import auth_bp
from blueprints.admin import admin_bp
from blueprints.indicators import indicators_bp
from blueprints.utils import utils_bp
import os  # Add at top of file


app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

cors_origins = os.getenv('CORS_ALLOWED_ORIGINS')
if cors_origins:
    allowed_origins = [origin.strip() for origin in cors_origins.split(',')]
else:
    allowed_origins = []  # No CORS origins - will block all cross-origin requests

CORS(app, supports_credentials=True, origins=allowed_origins, allow_headers=['Content-Type', 'Authorization'])

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = None  # Disable redirects for API

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Authentication required'}), 401

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

def is_admin(user_id):
    """Check if user is an administrator"""
    with engine.connect() as conn:
        stmt = select(roles).where(
            (roles.c.id == str(user_id)) & 
            (roles.c.role == 'administrator')
        )
        res = conn.execute(stmt)
        return res.first() is not None

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(indicators_bp)
app.register_blueprint(utils_bp)

if __name__ == '__main__':
    app.run(port=5000, host='0.0.0.0')