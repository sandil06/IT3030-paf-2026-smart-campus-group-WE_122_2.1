import React from 'react';

const TYPE_ICONS = {
  BOOKING_APPROVED: '✅',
  BOOKING_REJECTED: '❌',
  BOOKING_CANCELLED: '🚫',
  TICKET_STATUS_CHANGED: '🔄',
  NEW_COMMENT: '💬',
};

const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '';

const NotificationList = ({ notifications, onMarkRead }) => {
  if (notifications.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</p>
        <p>No notifications yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {notifications.map(n => (
        <div
          key={n.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            border: `1px solid ${n.readStatus ? '#e2e8f0' : '#bfdbfe'}`,
            backgroundColor: n.readStatus ? '#f8fafc' : '#eff6ff',
            opacity: n.readStatus ? 0.75 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              {!n.readStatus && (
                <span style={{
                  width: '8px', height: '8px', background: '#3b82f6',
                  borderRadius: '50%', display: 'inline-block', flexShrink: 0
                }} />
              )}
              <span style={{ fontSize: '1rem' }}>{TYPE_ICONS[n.type] || '🔔'}</span>
              <p style={{ margin: 0, fontWeight: n.readStatus ? 400 : 600, color: '#1e293b' }}>
                {n.message}
              </p>
            </div>
            <small style={{ color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
              {n.type?.replace(/_/g, ' ')}
              {n.createdAt && ` · ${fmt(n.createdAt)}`}
              {n.readStatus && ' · Read'}
            </small>
          </div>
          {!n.readStatus && (
            <button
              className="btn btn-small"
              style={{ background: '#64748b', flexShrink: 0, marginLeft: '1rem' }}
              onClick={() => onMarkRead(n.id)}
            >
              Mark Read
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
