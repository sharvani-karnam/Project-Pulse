import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const BACKEND_URL = `${API_BASE_URL}/api/health`;

function Landing() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'
  const [backendMessage, setBackendMessage] = useState('');
  const [lastChecked, setLastChecked] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('projectpulse_token');
    setIsLoggedIn(!!token);
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    setStatus('checking');
    try {
      const response = await fetch(BACKEND_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStatus('connected');
      setBackendMessage(data.message || 'ProjectPulse backend is running');
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to connect to backend:', err);
      setStatus('disconnected');
      setBackendMessage('');
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  return (
    <div className="container">
      {/* Navigation Header */}
      <header className="header">
        <div className="brand">
          <span className="brand-badge-mark">P</span>
          <span className="brand-name">ProjectPulse</span>
        </div>
        <div className="nav-actions">
          {isLoggedIn ? (
            <Link to="/dashboard" className="btn-nav-primary">
              Open Dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-nav-ghost">
                Sign In
              </Link>
              <Link to="/register" className="btn-nav-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="main-content">
        <div className="hero-card">
          <div className="editorial-badge">
            <span className="badge-dot"></span>
            Student Team Collaboration
          </div>
          
          <h1 className="hero-editorial-title">
            Projects shouldn&apos;t<br />feel chaotic.
          </h1>
          
          <p className="hero-editorial-subtitle">
            ProjectPulse helps student teams plan, collaborate, and ship college assignments &amp; capstones together.
          </p>

          <div className="hero-cta-group">
            {isLoggedIn ? (
              <Link to="/dashboard" className="btn-hero-primary">
                Open Workspace &rarr;
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-hero-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn-hero-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Backend Connection Status Section */}
          <div className="status-section">
            <h2 className="status-heading">SYSTEM CONNECTION STATUS</h2>

            <div className={`status-box ${status}`}>
              <div className="status-indicator">
                <span className={`status-dot ${status}`}></span>
                <span className="status-text">
                  {status === 'checking' && 'Checking backend service...'}
                  {status === 'connected' && 'Backend Connected & Running ✓'}
                  {status === 'disconnected' && 'Backend Disconnected'}
                </span>
              </div>

              {status === 'connected' && backendMessage && (
                <div className="status-details">
                  <p className="response-label">Response from server:</p>
                  <code className="response-msg">&quot;{backendMessage}&quot;</code>
                </div>
              )}

              {status === 'disconnected' && (
                <div className="status-details error">
                  <p className="error-tip">
                    Make sure the backend server is running on <code>{API_BASE_URL}</code>.
                  </p>
                </div>
              )}

              <div className="status-meta">
                <span className="endpoint-text">
                  Endpoint: <code>GET /api/health</code>
                </span>
                {lastChecked && (
                  <span className="time-text">Checked at: {lastChecked}</span>
                )}
              </div>

              <button
                className="btn-check"
                onClick={checkBackendHealth}
                disabled={status === 'checking'}
              >
                {status === 'checking' ? 'Testing Connection...' : 'Recheck Connection'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>ProjectPulse &bull; Warm Editorial Productivity Workspace for Student Teams</p>
      </footer>
    </div>
  );
}

export default Landing;
