from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import select, update, delete, desc
from structure import indicators, roles, engine
import json
from datetime import datetime

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

def is_admin(user_id):
    """Check if user is an administrator"""
    with engine.connect() as conn:
        stmt = select(roles).where(
            (roles.c.id == str(user_id)) & 
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
        # First check if record exists
        check_stmt = select(indicators).where(
            (indicators.c.indicator_id == indicator_id) &
            (indicators.c.version_number == version)
        )
    
        # Proceed with update
        stmt = delete(indicators).where(
            (indicators.c.indicator_id == indicator_id) &
            (indicators.c.version_number == version))
        
        result = conn.execute(stmt)
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