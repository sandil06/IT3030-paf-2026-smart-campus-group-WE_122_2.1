import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import BookingList from '../components/BookingList';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings]     = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [error,    setError]        = useState('');
  const [message,  setMessage]      = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = useCallback(async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const res = await apiService.getUserBookings(user.userId);
      setBookings(res.data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(''), 4000); return () => clearTimeout(t); }
  }, [message]);
  useEffect(() => {
    if (error)   { const t = setTimeout(() => setError(''),   6000); return () => clearTimeout(t); }
  }, [error]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setError('');
    try {
      await apiService.cancelBooking(id);
      setMessage('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = statusFilter ? bookings.filter(b => b.status === statusFilter) : bookings;

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page">
      <h2 className="page-header">📋 My Bookings</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Logged in as <strong>{user?.name || user?.email}</strong>
      </p>

      {/* Summary badges */}
      {bookings.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s =>
            counts[s] ? (
              <span key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                style={{
                  padding: '0.3rem 0.85rem', borderRadius: '9999px', fontSize: '0.82rem',
                  fontWeight: 600, cursor: 'pointer', border: '2px solid',
                  borderColor: statusFilter === s ? '#1e3a8a' : 'transparent',
                  background: s === 'PENDING' ? '#fef3c7' : s === 'APPROVED' ? '#d1fae5' : s === 'REJECTED' ? '#fee2e2' : '#f1f5f9',
                  color: s === 'PENDING' ? '#92400e' : s === 'APPROVED' ? '#065f46' : s === 'REJECTED' ? '#991b1b' : '#475569',
                }}>
                {s} ({counts[s]})
              </span>
            ) : null
          )}
          {statusFilter && (
            <button onClick={() => setStatusFilter('')}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}>
              Clear filter
            </button>
          )}
        </div>
      )}

      {message && <div className="alert alert-success">{message}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading your bookings...</p>
      ) : (
        <BookingList bookings={filtered} onCancel={handleCancel} showActions />
      )}
    </div>
  );
};

export default MyBookings;
