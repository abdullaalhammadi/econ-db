import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import UploadForm from './components/UploadForm';
import DatasetList from './components/DatasetList';
import DatasetPage from './components/DatasetPage';
import Login from './components/Login';
import AdminApproval from './components/AdminApproval';
import UserManagement from './components/UserManagement';
import AuditLog from './components/AuditLog';
import { getStatus, checkAdminAccess } from './utils/api';

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const { logged_in } = await getStatus();
      setLoggedIn(logged_in);
      
      if (logged_in) {
        try {
          const { is_admin } = await checkAdminAccess();
          setIsAdmin(is_admin);
        } catch (error) {
          console.error('Failed to check admin access:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkStatus();
  }, []);

  if (loggedIn === null) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation loggedIn={loggedIn} setLoggedIn={setLoggedIn} isAdmin={isAdmin || false} />
        <main className="py-8">
          <Routes>
            <Route path="/login" element={!loggedIn ? <Login onLoginSuccess={() => {
              setLoggedIn(true);
              // Check admin status after successful login
              checkAdminAccess().then(({ is_admin }) => {
                setIsAdmin(is_admin);
              }).catch(() => {
                setIsAdmin(false);
              });
            }} /> : <Navigate to="/" />} />

            <Route
              path="/"
              element={loggedIn ? <DatasetList isAdmin={isAdmin || false} /> : <Navigate to="/login" />}
            />
            <Route
              path="/datasets/:indicatorId"
              element={loggedIn ? <DatasetPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/upload"
              element={loggedIn ? <UploadForm onUploadSuccess={() => {}} /> : <Navigate to="/login" />}
            />
            <Route 
              path="/admin" 
              element={loggedIn && isAdmin ? <AdminApproval /> : <Navigate to="/" />}
            />
            <Route 
              path="/admin/users" 
              element={loggedIn && isAdmin ? <UserManagement /> : <Navigate to="/" />}
            />
            <Route 
              path="/admin/audit" 
              element={loggedIn && isAdmin ? <AuditLog /> : <Navigate to="/" />}
            />

          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
