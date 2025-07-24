import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Database, LogOut, LogIn, UserPlus } from 'lucide-react';
import { logout } from '../utils/api';

interface NavigationProps {
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ loggedIn, setLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Database className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Economic Indicator Database</h1>
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
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-medium transition-colors text-red-600 hover:text-red-900 hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <LogIn className="h-4 w-4 inline mr-2" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <UserPlus className="h-4 w-4 inline mr-2" />
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
