import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <NavLink to="/">🏫 Campus Hub</NavLink>
      </div>

      <ul className="nav-links">
        <li><NavLink to="/"             className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>Home</NavLink></li>
        <li><NavLink to="/resources"    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Resources</NavLink></li>
        <li><NavLink to="/booking"      className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Book</NavLink></li>
        <li><NavLink to="/my-bookings"  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>My Bookings</NavLink></li>
        <li><NavLink to="/tickets"      className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Tickets</NavLink></li>
        <li><NavLink to="/notifications"className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Notifications</NavLink></li>

        {isAdmin && (
          <>
            <li><NavLink to="/admin"             className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink></li>
            <li><NavLink to="/resources/manage"  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Resources ⚙</NavLink></li>
          </>
        )}
      </ul>

      <div className="nav-user">
        {/* Avatar */}
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            title={`${user.name} (${user.email})`}
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }}
          />
        ) : (
          <span style={{ fontSize: '1.25rem' }}>👤</span>
        )}

        {/* Name */}
        <span style={{ color: 'white', fontSize: '0.875rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user?.email}>
          {user?.name?.split(' ')[0] || 'User'}
        </span>

        {/* Role badge */}
        <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-user'}`}>
          {user?.role || 'USER'}
        </span>

        <button className="btn btn-small btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
