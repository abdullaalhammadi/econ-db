import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import UploadForm from './components/UploadForm';
import DatasetList from './components/DatasetList';
import Login from './components/Login';
import Register from './components/Register';
import { getStatus } from './utils/api';

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const { logged_in } = await getStatus();
      setLoggedIn(logged_in);
    };
    checkStatus();
  }, []);

  if (loggedIn === null) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
        <main className="py-8">
          <Routes>
            <Route path="/login" element={!loggedIn ? <Login onLoginSuccess={() => setLoggedIn(true)} /> : <Navigate to="/" />} />
            <Route path="/register" element={!loggedIn ? <Register /> : <Navigate to="/" />} />
            
            <Route 
              path="/" 
              element={loggedIn ? <DatasetList /> : <Navigate to="/login" />}
            />
            <Route 
              path="/upload" 
              element={loggedIn ? <UploadForm onUploadSuccess={() => {}} /> : <Navigate to="/login" />}
            />

          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
