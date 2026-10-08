# Econ-DB - Economic Indicators Management System

A comprehensive web-based system for managing, reviewing, and approving economic indicators with version control, LDAP authentication, and role-based access control.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

**Econ-DB** is an economic indicators database management system designed for teams that need to collaboratively manage economic data with quality assurance workflows. The system provides:

- **Centralized Repository**: Single source of truth for economic indicators
- **Version Control**: Automatic version tracking for all indicator updates
- **Approval Workflow**: Quality control through a review and approval process
- **Multi-language Support**: Full support for English and Arabic
- **Enterprise Authentication**: Integration with LDAP/Active Directory
- **Audit Trail**: Complete logging of all system actions for compliance

### Use Cases

- Government agencies managing economic statistics
- Research institutions collecting economic indicators
- Financial institutions tracking economic metrics
- International organizations requiring multi-language support

## Key Features

✅ **Version Control**: Automatic versioning for all indicator updates
✅ **Approval Workflow**: Pending Review → Approved/Rejected with feedback
✅ **Multi-language**: English and Arabic indicator names
✅ **Advanced Search**: Fuzzy search with source and domain filtering
✅ **Data Export**: CSV and Excel export capabilities
✅ **Role-based Access**: Standard users and administrators
✅ **LDAP/AD Integration**: Enterprise authentication
✅ **Audit Logging**: Complete action history with timestamps
✅ **Responsive UI**: Card/list view modes, mobile-friendly
✅ **Data Upload**: CSV file parsing and validation

## Architecture

### System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │────────▶│  Flask Backend  │────────▶│   SQL Server    │
│   (Nginx:80)    │  HTTP   │  (Gunicorn:5000)│  ODBC   │   (Port 1433)   │
│                 │         │                 │         │                 │
└─────────────────┘         └────────┬────────┘         └─────────────────┘
                                     │
                                     │ LDAP/AD Auth
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │   LDAP Server   │
                            │   (Port 389)    │
                            │                 │
                            └─────────────────┘
```

### Component Overview

1. **Frontend**: React TypeScript SPA served by Nginx
2. **Backend**: Flask REST API with SQLAlchemy ORM
3. **Database**: SQL Server with 4 main tables (indicators, users, roles, audit_logs)
4. **Authentication**: LDAP/Active Directory integration
5. **CI/CD**: GitHub Actions for automated builds and deployments

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with React Router DOM 7.7.0
- **Language**: TypeScript 5.5.3
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Lucide React (icons), PapaParse (CSV parsing)
- **Search**: Fuse.js 7.0.0 (fuzzy search)
- **Export**: XLSX 0.18.5 (Excel support)

### Backend
- **Framework**: Flask 3.1.1 (Python 3.12)
- **ORM**: SQLAlchemy 2.0.41
- **Authentication**: Flask-Login 0.6.3, LDAP3 2.9.1+
- **Database Driver**: pyodbc 5.3.0 (ODBC Driver 18 for SQL Server)
- **Web Server**: Gunicorn 23.0.0
- **CORS**: flask-cors 6.0.1

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (Alpine Linux)
- **Database**: Microsoft SQL Server
- **CI/CD**: GitHub Actions
- **Registry**: GitHub Container Registry (GHCR)

## Prerequisites

### Development Environment

- **Node.js**: v18+ (for frontend development)
- **Python**: 3.12+ (for backend development)
- **Docker**: 20.10+ (for containerized deployment)
- **SQL Server**: 2019+ or Azure SQL Database
- **LDAP/AD Server**: For authentication (or OpenLDAP for testing)

### System Dependencies

**For Backend Development (non-Docker)**:
- SQL Server ODBC Driver 18
- Python 3.12+ with pip
- Git

**For Frontend Development**:
- Node.js 18+ with npm
- Git

**For Production Deployment**:
- Docker Engine 20.10+
- Docker Compose (optional, for local testing)
- SSH access to deployment servers

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd econ-db
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 4. Install SQL Server ODBC Driver

**Ubuntu/Debian**:
```bash
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list | sudo tee /etc/apt/sources.list.d/mssql-release.list
sudo apt-get update
sudo ACCEPT_EULA=Y apt-get install -y msodbcsql18
```

**macOS**:
```bash
brew install unixodbc
brew tap microsoft/mssql-release https://github.com/Microsoft/homebrew-mssql-release
brew install msodbcsql18
```

**Windows**:
Download and install from [Microsoft's website](https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)

## Environment Configuration

### Backend Environment Variables

Create `backend/.env` with the following configuration:

```bash
# SQL Server Database Configuration
SQLSERVER_HOST=localhost          # Database server hostname
SQLSERVER_PORT=1433               # Database server port
SQLSERVER_DATABASE=appdb          # Database name
SQLSERVER_USERNAME=sa             # Database username
SQLSERVER_PASSWORD=YourPassword   # Database password

# Flask Configuration
SECRET_KEY=your-secret-key-here   # Flask session encryption key (use long random string)
CORS_ALLOWED_ORIGINS=https://your-frontend.com,http://localhost:5173

# LDAP/Active Directory Configuration
LDAP_SERVER=ldap://your-ldap-server.com  # LDAP server URL
LDAP_PORT=389                             # LDAP port (389 for LDAP, 636 for LDAPS)
LDAP_USE_SSL=false                        # Set to 'true' for LDAPS

# LDAP Base Configuration
LDAP_BASE_DN=dc=example,dc=com
LDAP_USER_SEARCH_BASE=ou=Users,dc=example,dc=com

# LDAP Service Account (for user lookups)
LDAP_BIND_USER=cn=service-account,ou=Users,dc=example,dc=com
LDAP_BIND_PASSWORD=service-password

# LDAP User Authentication Settings
# For Active Directory:
LDAP_USER_FILTER=(sAMAccountName={username})
LDAP_DOMAIN=YOURDOMAIN  # Windows domain for NTLM authentication

# For OpenLDAP:
# LDAP_USER_FILTER=(cn={username})
# LDAP_USER_DN_TEMPLATE=cn={username},ou=Users,dc=example,dc=com
# LDAP_DOMAIN=  # Leave empty for OpenLDAP

# LDAP Attribute Mapping
LDAP_USERNAME_ATTR=sAMAccountName  # or 'cn' for OpenLDAP
LDAP_DISPLAY_NAME_ATTR=displayName
```

### Frontend Environment Variables

Create `frontend/.env`:

```bash
# API Backend URL
VITE_API_BASE_URL=http://localhost:5000

# For production:
# VITE_API_BASE_URL=https://your-api-domain.com
```

### Environment Variables Reference

#### Database Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `SQLSERVER_HOST` | SQL Server hostname/IP | `localhost` or `db.example.com` |
| `SQLSERVER_PORT` | SQL Server port | `1433` |
| `SQLSERVER_DATABASE` | Database name | `appdb` |
| `SQLSERVER_USERNAME` | Database user | `sa` or `app_user` |
| `SQLSERVER_PASSWORD` | Database password | `YourStr0ng!Pass` |

#### LDAP Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `LDAP_SERVER` | LDAP server URL | `ldap://ldap.company.com` |
| `LDAP_PORT` | LDAP port | `389` (LDAP) or `636` (LDAPS) |
| `LDAP_USE_SSL` | Enable SSL/TLS | `true` or `false` |
| `LDAP_BASE_DN` | Base distinguished name | `dc=company,dc=com` |
| `LDAP_USER_SEARCH_BASE` | User search base | `ou=Users,dc=company,dc=com` |
| `LDAP_BIND_USER` | Service account DN | `cn=svc_app,ou=Users,dc=company,dc=com` |
| `LDAP_BIND_PASSWORD` | Service account password | `SecurePassword123` |
| `LDAP_USER_FILTER` | User search filter | `(sAMAccountName={username})` (AD) or `(cn={username})` (OpenLDAP) |
| `LDAP_DOMAIN` | Windows domain | `COMPANY` (AD only, leave empty for OpenLDAP) |

## Database Setup

### 1. Create Database and Schema

Connect to your SQL Server instance and run:

```sql
-- Create database
CREATE DATABASE appdb;
GO

USE appdb;
GO

-- Create schema
CREATE SCHEMA app_dev;
GO
```

### 2. Initialize Tables

The backend will automatically create tables on first run. Alternatively, you can manually create them:

```sql
USE appdb;
GO

-- Indicators table
CREATE TABLE app_dev.indicators (
    indicator_id NVARCHAR(50) NOT NULL,
    version_number INT NOT NULL,
    indicator_name_en NVARCHAR(255),
    indicator_name_ar NVARCHAR(255),
    added_by NVARCHAR(255),
    qc_by NVARCHAR(255),
    added_date DATETIME,
    notes NVARCHAR(MAX),
    source NVARCHAR(255),
    domain NVARCHAR(255),
    data NVARCHAR(MAX),
    approval_status NVARCHAR(50),
    approved_by NVARCHAR(255),
    approval_date DATETIME,
    rejection_reason NVARCHAR(MAX),
    PRIMARY KEY (indicator_id, version_number)
);

-- Users table
CREATE TABLE app_dev.users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL
);

-- Roles table
CREATE TABLE app_dev.roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL
);

-- Audit logs table
CREATE TABLE app_dev.audit_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    event_time DATETIME NOT NULL,
    admin_user NVARCHAR(255),
    action_type NVARCHAR(100),
    target_user NVARCHAR(255),
    target_indicator NVARCHAR(100),
    old_value NVARCHAR(MAX),
    new_value NVARCHAR(MAX),
    details NVARCHAR(MAX)
);
```

### 3. Create First Admin User

After the application starts and you log in for the first time via LDAP, manually grant admin privileges:

```sql
USE appdb;
GO

-- Grant admin role to first user
INSERT INTO app_dev.roles (username, role)
VALUES ('your-ldap-username', 'administrator');
```

Subsequent admin users can be managed through the UI by existing administrators.

## Running the Application

### Development Mode

#### Backend

```bash
cd backend

# Activate virtual environment (if using)
source venv/bin/activate

# Run Flask development server
python endpoints.py

# Server will start on http://localhost:5000
```

#### Frontend

```bash
cd frontend

# Start Vite development server
npm run dev

# Server will start on http://localhost:5173
```

Access the application at [http://localhost:5173](http://localhost:5173)

### Production Mode (Docker)

#### Using Docker Compose (Local Testing)

```bash
# Build and run both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Using Individual Docker Containers

**Backend**:
```bash
cd backend

# Build image
docker build -t econ-db-backend .

# Run container
docker run -d \
  --name econ-db-backend \
  -p 5000:5000 \
  --env-file .env \
  econ-db-backend
```

**Frontend**:
```bash
cd frontend

# Build image
docker build -t econ-db-frontend .

# Run container
docker run -d \
  --name econ-db-frontend \
  -p 8080:80 \
  -e VITE_API_BASE_URL=http://your-backend-url:5000 \
  econ-db-frontend
```

## Deployment

### CI/CD Pipeline (GitHub Actions)

The project includes automated CI/CD workflows:

1. **Backend Workflow** ([.github/workflows/backend-docker.yml](.github/workflows/backend-docker.yml))
   - Triggers on push/PR to main (backend changes)
   - Builds Docker image
   - Pushes to GitHub Container Registry
   - Auto-deploys to production (on merge to main)

2. **Frontend Workflow** ([.github/workflows/frontend-docker.yml](.github/workflows/frontend-docker.yml))
   - Triggers on push/PR to main (frontend changes)
   - Builds multi-stage Docker image
   - Pushes to GitHub Container Registry

### Manual Deployment

#### Backend Deployment

```bash
# Pull latest image
docker pull ghcr.io/abdullaalhammadi/econ-db/backend:latest

# Stop and remove old container
docker stop econ-db-backend || true
docker rm econ-db-backend || true

# Run new container
docker run -d \
  --name econ-db-backend \
  -p 5000:5000 \
  -e SQLSERVER_HOST=your-db-host \
  -e SQLSERVER_PORT=1433 \
  -e SQLSERVER_DATABASE=appdb \
  -e SQLSERVER_USERNAME=your-username \
  -e SQLSERVER_PASSWORD=your-password \
  -e SECRET_KEY=your-secret-key \
  -e CORS_ALLOWED_ORIGINS=https://your-frontend.com \
  -e LDAP_SERVER=ldap://your-ldap-server \
  -e LDAP_PORT=389 \
  -e LDAP_BASE_DN=dc=example,dc=com \
  -e LDAP_USER_SEARCH_BASE=ou=Users,dc=example,dc=com \
  -e LDAP_BIND_USER=cn=service,ou=Users,dc=example,dc=com \
  -e LDAP_BIND_PASSWORD=service-password \
  -e LDAP_USER_FILTER='(sAMAccountName={username})' \
  -e LDAP_DOMAIN=YOURDOMAIN \
  ghcr.io/abdullaalhammadi/econ-db/backend:latest
```

#### Frontend Deployment

```bash
# Pull latest image
docker pull ghcr.io/abdullaalhammadi/econ-db/frontend:latest

# Stop and remove old container
docker stop econ-db-frontend || true
docker rm econ-db-frontend || true

# Run new container
docker run -d \
  --name econ-db-frontend \
  -p 8080:80 \
  -e VITE_API_BASE_URL=https://your-backend-api.com \
  ghcr.io/abdullaalhammadi/econ-db/frontend:latest
```

### Production Checklist

- [ ] SQL Server database created and accessible
- [ ] Database schema initialized
- [ ] LDAP/AD server accessible from backend
- [ ] Environment variables configured securely
- [ ] SSL certificates configured (recommended)
- [ ] CORS origins properly set
- [ ] First admin user created
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Firewall rules configured

## API Documentation

### Authentication Endpoints

#### POST `/login`
Authenticate user via LDAP/AD

**Request Body**:
```json
{
  "username": "john.doe",
  "password": "userpassword"
}
```

**Response**: Session cookie + user info

#### POST `/logout`
Clear user session

#### GET `/status`
Get current login status

**Response**:
```json
{
  "logged_in": true,
  "username": "john.doe"
}
```

### Indicator Endpoints

#### GET `/indicators`
Get all approved indicators (latest versions)

**Response**:
```json
[
  {
    "indicator_id": "IND001",
    "version_number": 2,
    "indicator_name_en": "GDP Growth Rate",
    "indicator_name_ar": "معدل نمو الناتج المحلي الإجمالي",
    "source": "Central Bank",
    "domain": "Macroeconomics",
    "approval_status": "approved",
    "added_date": "2024-01-15T10:30:00"
  }
]
```

#### POST `/indicators`
Create new indicator or version (requires authentication)

**Request Body**:
```json
{
  "indicator_id": "IND001",  // Optional: auto-generated if not provided
  "indicator_name_en": "GDP Growth Rate",
  "indicator_name_ar": "معدل نمو الناتج المحلي الإجمالي",
  "source": "Central Bank",
  "domain": "Macroeconomics",
  "notes": "Quarterly data",
  "qc_by": "Jane Smith",
  "data": [
    {"period": "Q1 2024", "value": 3.5},
    {"period": "Q2 2024", "value": 3.8}
  ]
}
```

#### GET `/indicators/<id>`
Get latest version of specific indicator

#### GET `/indicators/<id>/versions`
Get all versions of an indicator

#### GET `/indicators/<id>/versions/<version>`
Get specific version

#### GET `/indicators/<id>/data`
Get raw data for latest version

#### DELETE `/indicators/<id>/versions/<version>`
Delete pending version (own submissions only)

#### GET `/indicators/my-submissions`
Get all user submissions (requires authentication)

#### GET `/indicators/next-id`
Get next available indicator ID

### Admin Endpoints

#### GET `/admin/check-access`
Check admin privileges (requires authentication)

#### GET `/admin/pending-approvals`
Get all pending indicators for review (requires admin)

#### POST `/admin/approve/<id>/<version>`
Approve indicator version (requires admin)

**Request Body**:
```json
{
  "approved_by": "admin-username"
}
```

#### POST `/admin/reject/<id>/<version>`
Reject indicator version (requires admin)

**Request Body**:
```json
{
  "rejected_by": "admin-username",
  "rejection_reason": "Data validation failed - please check Q3 values"
}
```

#### GET `/admin/users`
Get all users with roles (requires admin)

#### PUT `/admin/users/<id>`
Update user role (requires admin)

**Request Body**:
```json
{
  "role": "administrator"  // or "standard"
}
```

#### GET `/admin/audit-logs`
Get audit logs with pagination (requires admin)

**Query Parameters**:
- `page` (default: 1)
- `per_page` (default: 50)
- `action_type`: Filter by action
- `admin_user`: Filter by user

### Utility Endpoints

#### GET `/test`
API health check

#### GET `/test/db`
Database connection test

## User Roles & Permissions

### Standard User
- View all approved indicators
- Upload new indicators
- Create new versions of indicators
- View their own submissions and status
- Receive feedback on rejected submissions
- Export data to CSV/Excel

### Administrator
All standard user permissions plus:
- Review pending submissions
- Approve/reject indicators with feedback
- Manage user roles
- View audit logs
- Delete indicators
- Access admin dashboard

### Permission Matrix

| Action | Standard User | Administrator |
|--------|--------------|---------------|
| View approved indicators | ✅ | ✅ |
| Upload indicators | ✅ | ✅ |
| View own submissions | ✅ | ✅ |
| Delete own pending submissions | ✅ | ✅ |
| Approve/reject indicators | ❌ | ✅ |
| Manage user roles | ❌ | ✅ |
| View audit logs | ❌ | ✅ |
| Delete any indicator | ❌ | ✅ |

## Project Structure

```
econ-db/
├── frontend/                      # React TypeScript frontend
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── AdminApproval.tsx # Admin approval queue
│   │   │   ├── AuditLog.tsx      # Audit log viewer
│   │   │   ├── DatasetList.tsx   # Indicator list with search
│   │   │   ├── DatasetPage.tsx   # Single indicator view
│   │   │   ├── DatasetViewer.tsx # Data table display
│   │   │   ├── DomainChip.tsx    # Domain badge component
│   │   │   ├── Login.tsx         # LDAP login form
│   │   │   ├── MySubmissions.tsx # User submissions view
│   │   │   ├── Navigation.tsx    # Header navigation
│   │   │   ├── UploadForm.tsx    # Indicator upload form
│   │   │   └── UserManagement.tsx # User role management
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── api.ts            # API client functions
│   │   │   ├── csvParser.ts      # CSV parsing utilities
│   │   │   └── storage.ts        # LocalStorage helpers
│   │   ├── App.tsx               # Main app with routing
│   │   └── main.tsx              # Entry point
│   ├── Dockerfile                # Multi-stage Docker build
│   ├── nginx.conf                # Nginx configuration
│   ├── entrypoint.sh             # Runtime env substitution
│   ├── package.json              # Node dependencies
│   ├── tsconfig.json             # TypeScript config
│   ├── tailwind.config.js        # Tailwind CSS config
│   └── vite.config.ts            # Vite build config
│
├── backend/                       # Flask Python backend
│   ├── blueprints/               # API route blueprints
│   │   ├── auth.py              # Authentication routes
│   │   ├── admin.py             # Admin routes
│   │   ├── indicators.py        # Indicator CRUD routes
│   │   └── utils.py             # Utility routes
│   ├── services/
│   │   └── ldap_auth.py         # LDAP authentication service
│   ├── endpoints.py              # Flask app initialization
│   ├── structure.py              # SQLAlchemy database models
│   ├── Dockerfile                # Python Flask container
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Environment configuration
│
├── .github/
│   └── workflows/
│       ├── backend-docker.yml    # Backend CI/CD
│       └── frontend-docker.yml   # Frontend CI/CD
│
├── deploy.sh                     # Backend deployment script
├── frontend_deploy.sh            # Frontend deployment script
├── docker-compose.ldap-test.yml  # Local LDAP testing
└── README.md                     # This file
```

### Key Files Description

#### Frontend
- [App.tsx](frontend/src/App.tsx): Main application router and layout
- [api.ts](frontend/src/utils/api.ts): Centralized API client
- [nginx.conf](frontend/nginx.conf): Nginx configuration with SPA routing and API proxy
- [entrypoint.sh](frontend/entrypoint.sh): Runtime environment variable injection

#### Backend
- [endpoints.py](backend/endpoints.py): Flask app initialization and blueprint registration
- [structure.py](backend/structure.py): SQLAlchemy database schema
- [ldap_auth.py](backend/services/ldap_auth.py): LDAP/AD authentication logic
- [indicators.py](backend/blueprints/indicators.py): Main indicator API endpoints

## Development Workflow

### Local Development Setup

1. **Start Database**: Ensure SQL Server is running and accessible
2. **Start LDAP** (if testing locally):
   ```bash
   docker-compose -f docker-compose.ldap-test.yml up -d
   ```
3. **Start Backend**:
   ```bash
   cd backend
   python endpoints.py
   ```
4. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

### Making Changes

#### Frontend Changes
1. Edit components in `frontend/src/components/`
2. Test locally with `npm run dev`
3. Build for production: `npm run build`
4. Test production build: `npm run preview`

#### Backend Changes
1. Edit endpoints in `backend/blueprints/`
2. Update models in `backend/structure.py` if needed
3. Test locally with Flask development server
4. Test with Docker: `docker build -t test-backend ./backend`

### Database Migrations

When changing database schema:

1. Update models in [structure.py](backend/structure.py)
2. Create migration SQL manually or use SQLAlchemy migrations
3. Test migration on development database
4. Apply to production database with proper backups

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Testing LDAP Authentication Locally

Use the included OpenLDAP test container:

```bash
# Start OpenLDAP server
docker-compose -f docker-compose.ldap-test.yml up -d

# Test credentials:
# Username: testuser    Password: password123
# Username: adminuser   Password: admin123

# Stop when done
docker-compose -f docker-compose.ldap-test.yml down
```

## Troubleshooting

### Common Issues

#### Backend Connection Issues

**Issue**: "Cannot connect to SQL Server"

**Solution**:
```bash
# Test database connection
cd backend
python -c "import pyodbc; print(pyodbc.drivers())"

# Verify ODBC driver is installed
odbcinst -q -d

# Check connection string in .env
# Try telnet to test network connectivity
telnet your-db-host 1433
```

#### LDAP Authentication Fails

**Issue**: "LDAP authentication failed"

**Solutions**:
- Verify LDAP server is accessible: `telnet ldap-server 389`
- Check LDAP_BASE_DN matches your LDAP structure
- Verify service account credentials (LDAP_BIND_USER/PASSWORD)
- For AD: ensure LDAP_DOMAIN is correct
- Check LDAP_USER_FILTER matches your LDAP schema
- Enable LDAP debug logging in [ldap_auth.py](backend/services/ldap_auth.py:1)

#### Frontend Cannot Reach Backend

**Issue**: CORS errors or API timeouts

**Solution**:
```bash
# Check CORS_ALLOWED_ORIGINS includes your frontend URL
# In backend/.env:
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.com

# Verify VITE_API_BASE_URL in frontend/.env
# Make sure backend is running on the specified port
```

#### Docker Container Issues

**Issue**: Container exits immediately

**Solutions**:
```bash
# Check container logs
docker logs econ-db-backend
docker logs econ-db-frontend

# Verify environment variables
docker exec econ-db-backend env

# Check if port is already in use
lsof -i :5000  # Backend port
lsof -i :8080  # Frontend port
```

#### Database Table Not Found

**Issue**: "Table 'app_dev.indicators' doesn't exist"

**Solution**:
```bash
# Run table creation SQL manually
# Or let SQLAlchemy create tables on first run
cd backend
python -c "from structure import *; engine.begin(); Base.metadata.create_all(engine)"
```

### Logging and Debugging

#### Backend Logs
```bash
# Development mode - logs to console
cd backend
python endpoints.py

# Docker container logs
docker logs -f econ-db-backend
```

#### Frontend Logs
```bash
# Development mode - browser console
# Production mode - Nginx access logs
docker exec econ-db-frontend tail -f /var/log/nginx/access.log
```

#### Database Query Logs

Enable SQLAlchemy logging in [endpoints.py](backend/endpoints.py:1):
```python
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

### Performance Issues

#### Slow Indicator List Loading

- Check database indexes on `indicator_id`, `approval_status`, `added_date`
- Monitor SQL Server query performance
- Consider implementing pagination for large datasets

#### Large File Uploads Failing

- Adjust Nginx `client_max_body_size` in [nginx.conf](frontend/nginx.conf:1)
- Increase Flask `MAX_CONTENT_LENGTH` in [endpoints.py](backend/endpoints.py:1)
- Check available disk space

## Contributing

### Code Style

**Python** (Backend):
- Follow PEP 8 style guide
- Use type hints where applicable
- Document functions with docstrings

**TypeScript** (Frontend):
- Use ESLint configuration provided
- Follow React best practices
- Use functional components with hooks

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with clear commit messages
3. Test locally (both frontend and backend)
4. Ensure no linting errors: `npm run lint` (frontend)
5. Update documentation if needed
6. Submit pull request with description of changes
7. Wait for CI/CD checks to pass
8. Request review from team members

### Commit Message Format

```
<type>: <short summary>

<detailed description if needed>

Examples:
feat: Add CSV export functionality to dataset viewer
fix: Resolve LDAP authentication timeout issue
docs: Update API documentation for approval endpoints
refactor: Simplify indicator version management logic
```

### Adding New Features

1. **Plan**: Document the feature requirements
2. **Database**: Update schema if needed
3. **Backend**: Add API endpoints and business logic
4. **Frontend**: Create/update UI components
5. **Test**: Test end-to-end functionality
6. **Document**: Update this README and API docs
7. **Deploy**: Merge to main for automatic deployment

---

## Support & Contacts

For questions or issues:
- Create an issue in the GitHub repository
- Contact the development team
- Check the troubleshooting section above

## License

[Specify your license here]

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintained By**: [Your Team Name]
