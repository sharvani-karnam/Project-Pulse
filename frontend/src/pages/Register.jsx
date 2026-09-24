import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all the required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and retype.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('projectpulse_token', data.token);
      localStorage.setItem('projectpulse_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration connection error:', err);
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Your team&apos;s workspace, simplified.</p>
        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="auth-alert error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g. Alex Kumar"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
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
            <label htmlFor="password">Password (min. 6 characters)</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Retype your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in &rarr;
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

export default Register;
