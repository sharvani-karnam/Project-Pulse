import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect straight to dashboard
  useEffect(() => {
    const token = localStorage.getItem('projectpulse_token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('projectpulse_token', data.token);
      localStorage.setItem('projectpulse_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      console.error('Login connection error:', err);
      setError('Unable to reach the server. Make sure the backend server is running.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header Branding */}
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            <span className="brand-badge-mark">P</span>
            <span className="brand-name">ProjectPulse</span>
          </Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Your team&apos;s workspace, simplified.</p>
        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="auth-alert error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">College / Personal Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="e.g. alex@college.edu"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="auth-footer">
          <p>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="auth-link">
              Create account &rarr;
            </Link>
          </p>
          <Link to="/" className="back-link">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
