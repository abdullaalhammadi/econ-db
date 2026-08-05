import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Upload, Database, LogOut, LogIn, Shield, Users, History, ChevronDown, FileText } from 'lucide-react';
import { logout } from '../utils/api';

interface NavigationProps {
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
  isAdmin?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ loggedIn, setLoggedIn, isAdmin = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Database className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Secondary Data Hub</h1>
          </Link>
          
          <nav className="flex items-center space-x-2">
            {loggedIn ? (
              <>
                <Link
                  to="/upload"
                  className="px-4 py-2 rounded-lg font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  Upload Dataset
                </Link>
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Database className="h-4 w-4 inline mr-2" />
                  View Datasets
                </Link>
                <Link
                  to="/my-submissions"
                  className="px-4 py-2 rounded-lg font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  My Submissions
                </Link>
                {isAdmin && (
                  <div className="relative">
                    <button
                      onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                        isAdminRoute
                          ? 'text-blue-600 bg-blue-100'
                          : 'text-blue-600 hover:text-blue-900 hover:bg-blue-100'
                      }`}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                      <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {adminMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <Link
                            to="/admin"
                            className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                              location.pathname === '/admin' ? 'bg-gray-50 text-blue-600' : 'text-gray-700'
                            }`}
                            onClick={() => setAdminMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4 inline mr-2" />
                            Pending Approvals
                          </Link>
                          <Link
                            to="/admin/users"
                            className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                              location.pathname === '/admin/users' ? 'bg-gray-50 text-blue-600' : 'text-gray-700'
                            }`}
                            onClick={() => setAdminMenuOpen(false)}
                          >
                            <Users className="h-4 w-4 inline mr-2" />
                            User Management
                          </Link>
                          <Link
                            to="/admin/audit"
                            className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                              location.pathname === '/admin/audit' ? 'bg-gray-50 text-blue-600' : 'text-gray-700'
                            }`}
                            onClick={() => setAdminMenuOpen(false)}
                          >
                            <History className="h-4 w-4 inline mr-2" />
                            Audit Log
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-medium transition-colors text-red-600 hover:text-red-900 hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <LogIn className="h-4 w-4 inline mr-2" />
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
