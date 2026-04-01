import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user, isAdmin } = useAuth();

  const userCards = [
    { path: '/resources',    emoji: '🏛', label: 'Browse Resources',  desc: 'View lecture halls, labs, meeting rooms, and equipment.' },
    { path: '/booking',      emoji: '📅', label: 'Book a Resource',   desc: 'Submit a booking request for any available resource.' },
    { path: '/my-bookings',  emoji: '📋', label: 'My Bookings',       desc: 'View and cancel your existing reservations.' },
    { path: '/tickets',      emoji: '🎫', label: 'Support Tickets',   desc: 'Report campus issues and track resolution progress.' },
    { path: '/notifications',emoji: '🔔', label: 'Notifications',     desc: 'Stay updated on booking approvals and ticket updates.' },
  ];

  const adminCards = [
    { path: '/admin',             emoji: '⚙️', label: 'Admin Dashboard',    desc: 'Approve bookings, manage tickets, view statistics.' },
    { path: '/resources/manage',  emoji: '🔧', label: 'Manage Resources',   desc: 'Create, edit, enable or disable campus resources.' },
  ];

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '2rem 0 2.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏫</div>
        <h1 style={{ fontSize: '2rem', color: '#1e3a8a', marginBottom: '0.5rem', fontWeight: 800 }}>
          Smart Campus Operations Hub
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '0 auto' }}>
          Welcome, <strong>{isAdmin ? 'Admin' : 'User'}</strong>!
        </p>
        <span style={{
          display: 'inline-block', marginTop: '0.75rem',
          padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700,
          background: isAdmin ? '#fef3c7' : '#dbeafe', color: isAdmin ? '#92400e' : '#1e40af',
        }}>
          {isAdmin ? '⚡ Admin Access' : '👤 User Access'}
        </span>
      </div>

      {/* User section */}
      <h3 style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
        Quick Actions
      </h3>
      <div className="grid" style={{ marginBottom: '2rem' }}>
        {userCards.map(item => (
          <Link to={item.path} key={item.path} style={{ textDecoration: 'none' }}>
            <div className="card nav-card" style={{ transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{item.emoji}</div>
              <h3 style={{ color: '#1e3a8a', marginBottom: '0.4rem', fontSize: '1rem' }}>{item.label}</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Admin section — only shown to admins */}
      {isAdmin && (
        <>
          <h3 style={{ color: '#92400e', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            ⚡ Admin Tools
          </h3>
          <div className="grid">
            {adminCards.map(item => (
              <Link to={item.path} key={item.path} style={{ textDecoration: 'none' }}>
                <div className="card nav-card" style={{ borderTop: '3px solid #f59e0b', transition: 'transform 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{item.emoji}</div>
                  <h3 style={{ color: '#92400e', marginBottom: '0.4rem', fontSize: '1rem' }}>{item.label}</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
