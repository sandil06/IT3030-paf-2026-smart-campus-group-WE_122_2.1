import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../contexts/AuthContext';

/**
 * LoginPage — shown to unauthenticated visitors.
 *
 * Flow:
 * 1. User clicks the Google button.
 * 2. @react-oauth/google returns a credential (ID token).
 * 3. We decode it client-side to extract { email, name, picture }.
 * 4. AuthContext.login() POSTs to /api/auth/google and stores the response.
 * 5. Navigate to home.
 */
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [error, setError]     = useState(
    // Show a clear config error if Client ID is missing
    (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-client-id-here')
      ? '⚙️ Google Client ID is not configured. Add REACT_APP_GOOGLE_CLIENT_ID to .env and restart the dev server.'
      : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      // Decode the Google ID token — safe, it's just base64
      const decoded = jwtDecode(credentialResponse.credential);
      await login({
        email:   decoded.email,
        name:    decoded.name,
        picture: decoded.picture,
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    setError('Google sign-in failed or was cancelled. Make sure http://localhost:3000 is added to Authorized JavaScript Origins in Google Cloud Console.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        padding: '3rem 2.5rem',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
        textAlign: 'center',
      }}>
        {/* Logo / brand */}
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🏫</div>
        <h1 style={{
          color: '#1e3a8a',
          fontSize: '1.6rem',
          fontWeight: 800,
          marginBottom: '0.4rem',
          letterSpacing: '-0.3px',
        }}>
          Smart Campus Hub
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Operations &amp; Resource Management
        </p>

        {/* Feature highlights */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}>
          {[
            '📅 Book campus resources',
            '🎫 Submit support tickets',
            '🔔 Get real-time notifications',
            '🔧 Manage resources (Admin)',
          ].map((item) => (
            <p key={item} style={{ margin: '0.35rem 0', fontSize: '0.88rem', color: '#475569' }}>
              {item}
            </p>
          ))}
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            color: '#dc2626',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ color: '#64748b', padding: '0.75rem' }}>Signing you in...</div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap={false}
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
              width="300"
            />
          </div>
        )}

        <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>
          First-time users are automatically registered with USER role.<br/>
          Contact your administrator to get ADMIN access.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
