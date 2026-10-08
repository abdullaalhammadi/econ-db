from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import select, update, delete, desc, insert
from structure import indicators, roles, users, audit_logs, engine
import json
from datetime import datetime
import time

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


def is_admin(user_id):
    """Check if user is an administrator"""
    with engine.connect() as conn:
        # First get the username from users table
        user_stmt = select(users.c.username).where(users.c.id == user_id)
        user_res = conn.execute(user_stmt)
        user = user_res.first()

        if not user:
            return False

        # Then check if that username has admin role
        stmt = select(roles).where(
            (roles.c.username == user.username) &
            (roles.c.role == 'administrator')
        )
        res = conn.execute(stmt)
        return res.first() is not None

@admin_bp.route('/pending-approvals', methods=['GET'])
@login_required
def get_pending_approvals():
    """Get all pending indicators for admin approval"""
    if not is_admin(current_user.id):
        return jsonify({'error': 'Admin access required'}), 403
    
    with engine.connect() as conn:
        stmt = select(indicators).where(
            indicators.c.approval_status == 'Pending Review'
        ).order_by(desc(indicators.c.added_date))
        
        res = conn.execute(stmt)
        rows = res.mappings().all()
        
        pending_indicators = []
        for row in rows:
            indicator = {
                'indicator_id': row['indicator_id'],
                'version_number': row['version_number'],
                'indicator_name_en': row['indicator_name_en'],
                'indicator_name_ar': row['indicator_name_ar'],
                'added_by': row['added_by'],
                'source': row['source'],
                'domain': row['domain'],
                'qc_by': row['qc_by'],
                'added_date': row['added_date'].isoformat() if row['added_date'] else '',
                'notes': row['notes'],
                'version_notes': row['version_notes'],
                'approval_status': row['approval_status'],
                'uploadedData': json.loads(row['data']) if row['data'] else []
            }
            pending_indicators.append(indicator)
        
        return jsonify(pending_indicators)

@admin_bp.route('/approve/<string:indicator_id>/<int:version>', methods=['POST'])
@login_required
def approve_indicator(indicator_id, version):
    """Approve an indicator"""
   
    if not is_admin(current_user.id):
        return jsonify({'error': 'Admin access required'}), 403
    
    with engine.connect() as conn:
        # Proceed with update
        stmt = update(indicators).where(
            (indicators.c.indicator_id == indicator_id) &
            (indicators.c.version_number == version)
        ).values(
            approval_status='approved',
            approved_by=current_user.username,
            approval_date=datetime.now()
        )
        
        result = conn.execute(stmt)
        
        # Log the action
        log_stmt = insert(audit_logs).values(
            id=int(time.time()),
            event_time=datetime.now(),
            admin_user=current_user.username,
            action_type='indicator_approve',
            target_indicator=indicator_id,
            details=f'Approved indicator {indicator_id} version {version}'
        )
        conn.execute(log_stmt)
        conn.commit()

        if result.rowcount > 0:
            return jsonify({'message': 'Indicator approved successfully'})
        else:
            return jsonify({'error': 'Indicator not found'}), 404

@admin_bp.route('/reject/<string:indicator_id>/<int:version>', methods=['POST'])
@login_required
def reject_indicator(indicator_id, version):
    """Reject an indicator"""
    
    if not is_admin(current_user.id):
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    rejection_reason = data.get('reason', '')
    
    with engine.connect() as conn:
        # Update status to 'rejected' instead of deleting
        # This preserves the submission history and allows users to see rejection reasons
        stmt = update(indicators).where(
            (indicators.c.indicator_id == indicator_id) &
            (indicators.c.version_number == version)
        ).values(
            approval_status='rejected',
            approved_by=current_user.username,  # Track who rejected it
            approval_date=datetime.now(),        # Track when it was rejected
            rejection_reason=rejection_reason
        )

        result = conn.execute(stmt)

        # Log the action
        log_stmt = insert(audit_logs).values(
            id=int(time.time()),
            event_time=datetime.now(),
            admin_user=current_user.username,
            action_type='indicator_reject',
            target_indicator=indicator_id,
            details=f'Rejected indicator {indicator_id} version {version}. Reason: {rejection_reason}'
        )
        conn.execute(log_stmt)
        conn.commit()

        if result.rowcount > 0:
            return jsonify({'message': 'Indicator rejected successfully'})
        else:
            return jsonify({'error': 'Indicator not found'}), 404

@admin_bp.route('/check-access', methods=['GET'])
@login_required
def check_admin_access():
    """Check if current user has admin access"""
    return jsonify({'is_admin': is_admin(current_user.id)})

@admin_bp.route('/users', methods=['GET'])
@login_required
def get_users():
    """Get all users with their roles"""
    if not is_admin(current_user.id):
        return jsonify({'error': 'Admin access required'}), 403
    
    with engine.connect() as conn:
        # Join users and roles tables
        stmt = select(
            users.c.id,
            users.c.username,
            roles.c.role
        ).select_from(
            users.join(roles, users.c.username == roles.c.username)
        ).order_by(users.c.username)
        
        res = conn.execute(stmt)
        rows = res.mappings().all()
        
        users_list = []
        for row in rows:
            users_list.append({
                'id': row['id'],
                'username': row['username'],
                'role': row['role']
            })
        
        return jsonify(users_list)

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@login_required
def update_user_role(user_id):
    """Update a user's role"""
    if not is_admin(current_user.id):
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    new_role = data.get('role')
    
    if new_role not in ['standard', 'administrator']:
        return jsonify({'error': 'Invalid role. Must be "standard" or "administrator"'}), 400
    
    with engine.connect() as conn:
        # First get the username from users table
        user_stmt = select(users.c.username).where(users.c.id == user_id)
        user_result = conn.execute(user_stmt)
        user = user_result.first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        target_username = user.username

        # Check if target user role exists
        check_stmt = select(roles).where(roles.c.username == target_username)
        result = conn.execute(check_stmt)
        target_role = result.first()

        if not target_role:
            return jsonify({'error': 'User role not found'}), 404

        # Prevent admins from changing other admins' roles
        if target_role.role == 'administrator' and user_id != current_user.id:
            return jsonify({'error': 'Cannot modify another administrator\'s role'}), 403

        old_role = target_role.role

        # Update the role
        update_stmt = update(roles).where(roles.c.username == target_username).values(role=new_role)
        conn.execute(update_stmt)
        
        # Log the action
        log_stmt = insert(audit_logs).values(
            id=int(time.time()),
            event_time=datetime.now(),
            admin_user=current_user.username,
            action_type='role_update',
            target_user=target_username,
            old_value=old_role,
            new_value=new_role,
            details=f'Role changed from {old_role} to {new_role}'
        )
        conn.execute(log_stmt)
        conn.commit()
        
        return jsonify({'message': f'User role updated to {new_role}'})

@admin_bp.route('/audit-logs', methods=['GET'])
@login_required
def get_audit_logs():
    """Get audit logs with optional pagination and filtering"""
    if not is_admin(current_user.id):
        return jsonify({'error': 'Admin access required'}), 403
    
    # Get query parameters
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 50)), 100)  # Max 100 records per page
    action_type = request.args.get('action_type')
    
    offset = (page - 1) * per_page
    
    with engine.connect() as conn:
        # Build base query
        base_stmt = select(audit_logs).order_by(desc(audit_logs.c.event_time))
        
        # Add filter if specified
        if action_type:
            base_stmt = base_stmt.where(audit_logs.c.action_type == action_type)
        
        # Get total count
        count_stmt = select(audit_logs.c.id)
        if action_type:
            count_stmt = count_stmt.where(audit_logs.c.action_type == action_type)
        
        total_result = conn.execute(count_stmt)
        total_count = len(total_result.fetchall())
        
        # Get paginated results
        stmt = base_stmt.offset(offset).limit(per_page)
        res = conn.execute(stmt)
        rows = res.mappings().all()
        
        logs = []
        for row in rows:
            logs.append({
                'id': row['id'],
                'event_time': row['event_time'].isoformat() if row['event_time'] else '',
                'admin_user': row['admin_user'],
                'action_type': row['action_type'],
                'target_user': row['target_user'],
                'target_indicator': row['target_indicator'],
                'old_value': row['old_value'],
                'new_value': row['new_value'],
                'details': row['details']
            })
        
        return jsonify({
            'logs': logs,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total_count,
                'pages': (total_count + per_page - 1) // per_page
            }
        })