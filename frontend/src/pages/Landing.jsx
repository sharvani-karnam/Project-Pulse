import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('projectpulse_token');
    setIsLoggedIn(!!token);
  }, []);

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
