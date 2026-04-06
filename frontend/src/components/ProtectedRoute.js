import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 *
 * Usage:
 *   <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
 *
 * For admin-only routes, pass requireAdmin={true}:
 *   <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect to login, preserving the intended URL so we can send them back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ color: '#dc2626', marginBottom: '0.75rem' }}>Access Denied</h2>
        <p style={{ color: '#64748b', maxWidth: '340px' }}>
          This page is restricted to administrators only.
          Contact your campus admin to request elevated access.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
