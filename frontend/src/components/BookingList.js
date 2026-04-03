import React from 'react';

const STATUS_STYLES = {
  PENDING:   { bg: '#fef3c7', color: '#92400e' },
  APPROVED:  { bg: '#d1fae5', color: '#065f46' },
  REJECTED:  { bg: '#fee2e2', color: '#991b1b' },
  CANCELLED: { bg: '#f1f5f9', color: '#475569' },
};

const fmt = (dt) => dt ? new Date(dt).toLocaleString(undefined, {
  month: 'short', day: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
}) : '—';

const BookingList = ({ bookings, onCancel, onApprove, onReject, showActions }) => {
  if (!bookings || bookings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
        <p style={{ margin: 0 }}>No bookings found.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Resource</th>
            <th>Purpose</th>
            <th>Date & Time</th>
            <th>Attendees</th>
            <th>Status</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => {
            const style = STATUS_STYLES[b.status] || {};
            return (
              <tr key={b.id}>
                <td>
                  <strong style={{ color: '#1e3a8a' }}>{b.resourceName || '—'}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {b.resourceId?.slice(-8)}
                  </div>
                </td>
                <td style={{ maxWidth: '200px' }}>
                  <span style={{ fontWeight: 500 }}>{b.purpose}</span>
                </td>
                <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', color: '#475569' }}>
                  <div>{fmt(b.startTime)}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>→ {fmt(b.endTime)}</div>
                </td>
                <td style={{ textAlign: 'center', color: '#64748b' }}>{b.attendees ?? '—'}</td>
                <td>
                  <span style={{
                    display: 'inline-block', padding: '0.25rem 0.65rem',
                    borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700,
                    background: style.bg, color: style.color,
                  }}>
                    {b.status}
                  </span>
                  {b.rejectionReason && (
                    <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                      Reason: {b.rejectionReason}
                    </div>
                  )}
                </td>
                {showActions && (
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {onApprove && b.status === 'PENDING' && (
                        <button className="btn btn-small" style={{ background: '#10b981' }}
                          onClick={() => onApprove(b.id)}>
                          ✓ Approve
                        </button>
                      )}
                      {onReject && b.status === 'PENDING' && (
                        <button className="btn btn-small btn-danger"
                          onClick={() => onReject(b.id)}>
                          ✕ Reject
                        </button>
                      )}
                      {onCancel && (b.status === 'PENDING' || b.status === 'APPROVED') && (
                        <button className="btn btn-small"
                          style={{ background: '#64748b' }}
                          onClick={() => onCancel(b.id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BookingList;
