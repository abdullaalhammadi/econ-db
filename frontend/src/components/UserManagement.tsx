import React, { useState, useEffect } from 'react';
import { User, Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import { getUsersWithRoles, updateUserRole } from '../utils/api';

interface UserWithRole {
  id: number;
  username: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsersWithRoles();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user: UserWithRole, role: string) => {
    setSelectedUser(user);
    setNewRole(role);
    setShowConfirmModal(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;

    setUpdating(selectedUser.id);
    setShowConfirmModal(false);

    try {
      await updateUserRole(selectedUser.id, newRole);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, role: newRole }
          : user
      ));
    } catch (error) {
      console.error('Failed to update user role:', error);
    } finally {
      setUpdating(null);
      setSelectedUser(null);
      setNewRole('');
    }
  };

  const cancelRoleChange = () => {
    setShowConfirmModal(false);
    setSelectedUser(null);
    setNewRole('');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage user roles and permissions
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">No users are registered in the system.</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'administrator'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role === 'administrator' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.role === 'administrator' ? (
                        <button
                          onClick={() => handleRoleChange(user, 'standard')}
                          disabled={updating === user.id}
                          className="text-orange-600 hover:text-orange-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updating === user.id ? 'Updating...' : 'Remove Admin'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(user, 'administrator')}
                          disabled={updating === user.id}
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updating === user.id ? 'Updating...' : 'Make Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  Confirm Role Change
                </h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700">
                  Are you sure you want to change <strong>{selectedUser.username}</strong>'s role 
                  from <strong>{selectedUser.role}</strong> to <strong>{newRole}</strong>?
                </p>
                
                {newRole === 'administrator' && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                    <p className="text-xs text-yellow-800">
                      <strong>Warning:</strong> This will grant full administrative privileges to this user.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmRoleChange}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Confirm Change
                </button>
                <button
                  onClick={cancelRoleChange}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;