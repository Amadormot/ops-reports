import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Checa se o usuário já havia feito login antes nessa máquina
    const token = localStorage.getItem('ops_reports_auth');
    if (token === 'granted') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('ops_reports_auth', 'granted');
    setIsAuthenticated(true);
  };

  if (loading) return null;

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard />;
}

export default App;
