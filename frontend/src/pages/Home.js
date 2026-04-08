import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const userCards = [
  { path: '/resources',     icon: '🏛',  label: 'Browse Resources',  desc: 'View lecture halls, labs, meeting rooms and equipment',  glow: 'rgba(108,92,231,0.25)' },
  { path: '/booking',       icon: '📅', label: 'Book a Resource',    desc: 'Submit a booking request for any available space',        glow: 'rgba(0,184,148,0.22)' },
  { path: '/my-bookings',   icon: '📋', label: 'My Bookings',        desc: 'View, track and cancel your existing reservations',       glow: 'rgba(0,206,201,0.2)'  },
  { path: '/tickets',       icon: '🎫', label: 'Support Tickets',    desc: 'Report campus issues and track resolution progress',      glow: 'rgba(253,203,110,0.22)' },
  { path: '/notifications', icon: '🔔', label: 'Notifications',      desc: 'Stay updated on booking approvals and ticket updates',    glow: 'rgba(116,185,255,0.2)' },
];

const adminCards = [
  { path: '/admin',            icon: '⚡', label: 'Admin Dashboard',  desc: 'Approve bookings, manage tickets, view system analytics', glow: 'rgba(253,203,110,0.28)' },
  { path: '/resources/manage', icon: '🔧', label: 'Manage Resources', desc: 'Create, edit, enable or disable campus resources',         glow: 'rgba(108,92,231,0.28)' },
];

const NavCard = ({ item, adminStyle = false }) => (
  <Link to={item.path} style={{ textDecoration: 'none' }}>
    <div
      className="glass-card lift"
      style={{
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        borderColor: adminStyle ? 'rgba(253,203,110,0.12)' : undefined,
        height: '100%',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: '50%',
        background: item.glow, filter: 'blur(32px)',
        pointerEvents: 'none',
      }} />

      {/* Icon bubble */}
      <div style={{
        width: 46, height: 46,
        borderRadius: 12,
        background: adminStyle ? 'rgba(253,203,110,0.1)' : 'rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', marginBottom: 14,
      }}>
        {item.icon}
      </div>

      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: adminStyle ? 'var(--warning)' : 'var(--text-primary)', marginBottom: 6 }}>
        {item.label}
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
        {item.desc}
      </p>
      <div style={{ marginTop: 16, fontSize: '0.75rem', fontWeight: 600, color: adminStyle ? 'var(--warning)' : 'var(--primary-light)' }}>
        Open {item.label} →
      </div>
    </div>
  </Link>
);

const Home = () => {
  const { user, isAdmin } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <>
      {/* Welcome Banner */}
      <div className="welcome-section">
        {user?.picture ? (
          <img src={user.picture} alt={user.name} className="welcome-avatar" />
        ) : (
          <div className="welcome-avatar-placeholder">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="welcome-text">
          <h2>Welcome back, {firstName}! 👋</h2>
          <p>
            {isAdmin
              ? 'You have Admin access — approve bookings, manage tickets and resources.'
              : 'Book campus resources, submit tickets, and stay updated on your requests.'}
          </p>
        </div>
        <span
          className={`badge badge-role-${isAdmin ? 'admin' : 'user'}`}
          style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.72rem', padding: '5px 12px' }}
        >
          {isAdmin ? '⚡ ADMIN' : '👤 USER'}
        </span>
      </div>

      {/* User Quick-Action Cards */}
      <p className="section-title">Quick Actions</p>
      <div className="cards-grid" style={{ marginBottom: 32 }}>
        {userCards.map(item => <NavCard key={item.path} item={item} />)}
      </div>

      {/* Admin Tools — visible only to admins */}
      {isAdmin && (
        <>
          <p className="section-title" style={{ color: 'var(--warning)' }}>⚡ Admin Tools</p>
          <div className="cards-grid">
            {adminCards.map(item => <NavCard key={item.path} item={item} adminStyle />)}
          </div>
        </>
      )}
    </>
  );
};

export default Home;
