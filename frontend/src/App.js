import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';

import Navbar         from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage      from './pages/LoginPage';
import Home           from './pages/Home';
import Resources      from './pages/Resources';
import ResourceManager from './pages/ResourceManager';
import Booking        from './pages/Booking';
import MyBookings     from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import Tickets        from './pages/Tickets';
import Notifications  from './pages/Notifications';

import './styles/main.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public route — login page has its own full-screen layout */}
            <Route path="/login" element={<LoginPage />} />

            {/* All other routes share the Navbar layout */}
            <Route
              path="/*"
              element={
                <div className="app-container">
                  <Navbar />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={
                        <ProtectedRoute><Home /></ProtectedRoute>
                      } />
                      <Route path="/resources" element={
                        <ProtectedRoute><Resources /></ProtectedRoute>
                      } />
                      <Route path="/booking" element={
                        <ProtectedRoute><Booking /></ProtectedRoute>
                      } />
                      <Route path="/my-bookings" element={
                        <ProtectedRoute><MyBookings /></ProtectedRoute>
                      } />
                      <Route path="/tickets" element={
                        <ProtectedRoute><Tickets /></ProtectedRoute>
                      } />
                      <Route path="/notifications" element={
                        <ProtectedRoute><Notifications /></ProtectedRoute>
                      } />
                      {/* Admin-only routes */}
                      <Route path="/admin" element={
                        <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
                      } />
                      <Route path="/resources/manage" element={
                        <ProtectedRoute requireAdmin><ResourceManager /></ProtectedRoute>
                      } />
                      {/* Catch-all redirect */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
