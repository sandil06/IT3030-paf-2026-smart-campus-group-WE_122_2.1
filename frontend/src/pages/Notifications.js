import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import NotificationList from '../components/NotificationList';

const TYPE_ICONS = {
  BOOKING_APPROVED:  '✅',
  BOOKING_REJECTED:  '❌',
  BOOKING_CANCELLED: '🚫',
  TICKET_STATUS_CHANGED: '📋',
  NEW_COMMENT:       '💬',
  GENERAL:           '🔔',
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [message,  setMessage]  = useState('');
  const [filter,   setFilter]   = useState('all'); // 'all' | 'unread'

  const fetchNotifications = useCallback(async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const res = await apiService.getUserNotifications(user.userId);
      setNotifications(res.data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    if (error)   { const t = setTimeout(() => setError(''),   6000); return () => clearTimeout(t); }
  }, [error]);
  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(''), 3000); return () => clearTimeout(t); }
  }, [message]);

  const handleMarkRead = async (id) => {
    try {
      await apiService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
    } catch (err) { setError(err.message); }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiService.markAllNotificationsRead(user.userId);
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
      setMessage('All notifications marked as read.');
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) { setError(err.message); }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return;
    try {
      await apiService.clearAllNotifications(user.userId);
      setNotifications([]);
      setMessage('All notifications cleared.');
    } catch (err) { setError(err.message); }
  };

  const unreadCount = notifications.filter(n => !n.readStatus).length;
  const displayed = filter === 'unread' ? notifications.filter(n => !n.readStatus) : notifications;

  return (
    <div className="page">
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 className="page-header" style={{ margin: 0 }}>
          🔔 Notifications
          {unreadCount > 0 && (
            <span style={{
              background: '#1e3a8a', color: 'white',
              padding: '0.2rem 0.6rem', borderRadius: '9999px',
              fontSize: '0.8rem', fontWeight: 700, marginLeft: '0.75rem',
            }}>
              {unreadCount} unread
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <button className="btn btn-small" style={{ background: '#475569' }} onClick={handleMarkAllRead}>
              ✓ Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn btn-small btn-danger" onClick={handleClearAll}>
              🗑 Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '0.4rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
              background: filter === f ? '#1e3a8a' : '#e2e8f0',
              color: filter === f ? 'white' : '#475569',
              fontWeight: filter === f ? 600 : 400,
              fontSize: '0.875rem',
            }}>
            {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading notifications...</p>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔕</div>
          <p>{filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {displayed.map(n => (
            <div key={n.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '1rem',
              padding: '1rem 1.25rem', borderRadius: '0.75rem',
              background: n.readStatus ? 'white' : '#eff6ff',
              border: `1px solid ${n.readStatus ? '#e2e8f0' : '#bfdbfe'}`,
              boxShadow: n.readStatus ? 'none' : '0 2px 8px rgba(59,130,246,0.08)',
            }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                {TYPE_ICONS[n.type] || '🔔'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, color: n.readStatus ? '#475569' : '#1e3a8a', fontWeight: n.readStatus ? 400 : 500, lineHeight: 1.5 }}>
                  {n.message}
                </p>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  {n.type?.replace(/_/g, ' ')} · {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                {!n.readStatus && (
                  <button onClick={() => handleMarkRead(n.id)}
                    style={{ background: 'none', border: '1px solid #93c5fd', color: '#1e3a8a', borderRadius: '0.375rem',
                      padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    Mark Read
                  </button>
                )}
                <button onClick={() => handleDelete(n.id)}
                  style={{ background: 'none', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '0.375rem',
                    padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
