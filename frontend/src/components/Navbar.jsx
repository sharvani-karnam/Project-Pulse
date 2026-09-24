import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('projectpulse_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('projectpulse_token');
    localStorage.removeItem('projectpulse_user');
    navigate('/login');
  };

  const getInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="dashboard-nav">
      <div className="nav-left">
        <Link to="/dashboard" className="brand">
          <span className="brand-badge-mark">P</span>
          <span className="brand-name">ProjectPulse</span>
        </Link>
        <nav className="nav-links">
          <Link
            to="/dashboard"
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/projects"
            className={`nav-link ${location.pathname.startsWith('/projects') ? 'active' : ''}`}
          >
            Projects
          </Link>
        </nav>
      </div>

      <div className="nav-user-area">
        {user && (
          <div className="user-profile-chip">
            <span className="user-avatar-initial">{getInitial(user.name)}</span>
            <span className="user-name-text">{user.name}</span>
          </div>
        )}
        <button onClick={handleLogout} className="btn-logout" title="Sign out">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
