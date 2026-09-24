import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component
 * Checks for the JWT token in localStorage.
 * If token exists, renders the protected component.
 * If token is missing, redirects the user to /login.
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('projectpulse_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
