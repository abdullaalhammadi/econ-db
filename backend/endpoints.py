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

app = Flask(__name__)

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

CORS(app, supports_credentials=True, origins=['https://econ-db.pages.dev'], allow_headers=['Content-Type', 'Authorization'])  # Enable CORS for frontend connection

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