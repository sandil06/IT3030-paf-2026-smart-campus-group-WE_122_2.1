import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import BookingList from '../components/BookingList';

const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';

const TICKET_STATUS_FLOW = {
  OPEN:        ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED:    ['CLOSED'],
  CLOSED:      [],
  REJECTED:    [],
};

const TICKET_STATUS_COLORS = {
  OPEN: '#3b82f6', IN_PROGRESS: '#f59e0b',
  RESOLVED: '#10b981', CLOSED: '#64748b', REJECTED: '#ef4444',
};

const StatCard = ({ label, value, color, sub }) => (
  <div className="card" style={{ textAlign: 'center', padding: '1.25rem', borderTop: `4px solid ${color}` }}>
    <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>{sub}</div>}
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab]           = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [tickets,  setTickets]  = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [message,  setMessage]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectModal, setRejectModal]   = useState({ open: false, id: null, type: '', reason: '' });

  const clearAlerts = () => { setError(''); setMessage(''); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bookRes, tickRes, statsRes] = await Promise.all([
        apiService.getAllBookings(),
        apiService.getAllTickets(),
        apiService.getAdminStats(),
      ]);
      setBookings(bookRes.data);
      setTickets(tickRes.data);
      setStats(statsRes.data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(''), 4000); return () => clearTimeout(t); }
  }, [message]);

  // ── Booking actions ───────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    clearAlerts();
    try { await apiService.approveBooking(id); setMessage('Booking approved.'); fetchAll(); }
    catch (err) { setError(err.message); }
  };

  const openRejectModal = (id, type = 'booking') =>
    setRejectModal({ open: true, id, type, reason: '' });

  const handleRejectConfirm = async () => {
    if (!rejectModal.reason.trim()) { setError('Please provide a reason.'); return; }
    clearAlerts();
    try {
      if (rejectModal.type === 'booking') {
        await apiService.rejectBooking(rejectModal.id, rejectModal.reason);
        setMessage('Booking rejected.');
      } else {
        await apiService.updateTicketStatus(rejectModal.id, 'REJECTED', rejectModal.reason);
        setMessage('Ticket rejected.');
      }
      setRejectModal({ open: false, id: null, type: '', reason: '' });
      fetchAll();
    } catch (err) { setError(err.message); }
  };

  // ── Ticket actions ────────────────────────────────────────────────────────
  const handleTicketStatus = async (id, newStatus) => {
    if (newStatus === 'REJECTED') { openRejectModal(id, 'ticket'); return; }
    clearAlerts();
    try {
      await apiService.updateTicketStatus(id, newStatus);
      setMessage(`Ticket moved to ${newStatus}.`);
      fetchAll();
    } catch (err) { setError(err.message); }
  };

  const handleAssignTicket = async (id) => {
    clearAlerts();
    try {
      await apiService.assignTicket(id, user.userId);
      setMessage('Ticket assigned to you.');
      fetchAll();
    } catch (err) { setError(err.message); }
  };

  const filteredBookings = statusFilter
    ? bookings.filter(b => b.status === statusFilter)
    : bookings;
  const filteredTickets = statusFilter
    ? tickets.filter(t => t.status === statusFilter)
    : tickets;

  const tabBtn = (key, label) => (
    <button
      onClick={() => { setTab(key); setStatusFilter(''); }}
      style={{
        padding: '0.6rem 1.5rem', border: 'none', borderRadius: '0.5rem',
        background: tab === key ? '#1e3a8a' : '#e2e8f0',
        color: tab === key ? 'white' : '#475569',
        fontWeight: tab === key ? 700 : 500, cursor: 'pointer',
      }}
    >{label}</button>
  );

  return (
    <div className="page">
      <h2 className="page-header">Admin Dashboard</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard label="Total Resources" value={stats.totalResources} color="#3b82f6" />
          <StatCard label="Total Users"     value={stats.totalUsers}     color="#8b5cf6" />
          <StatCard label="Pending Bookings" value={stats.bookings?.pending}  color="#f59e0b" sub={`${stats.bookings?.total} total`} />
          <StatCard label="Open Tickets"    value={stats.tickets?.open}   color="#ef4444" sub={`${stats.tickets?.total} total`} />
          <StatCard label="Resolved Tickets" value={stats.tickets?.resolved} color="#10b981" />
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
          <div className="card" style={{ maxWidth:'450px', width:'90%', margin:0 }}>
            <h3 style={{ marginBottom:'1rem' }}>
              Reject {rejectModal.type === 'booking' ? 'Booking' : 'Ticket'}
            </h3>
            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <textarea className="form-textarea" rows="3"
                placeholder="Enter reason..."
                value={rejectModal.reason}
                onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
                autoFocus
              />
            </div>
            <div style={{ display:'flex', gap:'1rem' }}>
              <button className="btn btn-danger" onClick={handleRejectConfirm}>Confirm Reject</button>
              <button className="btn" style={{ background:'#64748b' }}
                onClick={() => setRejectModal({ open:false, id:null, type:'', reason:'' })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem' }}>
        {tabBtn('bookings', `📅 Bookings (${bookings.length})`)}
        {tabBtn('tickets',  `🎫 Tickets (${tickets.length})`)}
      </div>

      {/* Filters */}
      <div className="card" style={{ display:'flex', gap:'1rem', alignItems:'flex-end', flexWrap:'wrap', marginBottom:'1.5rem' }}>
        <div className="form-group" style={{ marginBottom:0 }}>
          <label className="form-label">Filter by Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select">
            <option value="">All Statuses</option>
            {tab === 'bookings' ? (
              <>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CANCELLED">CANCELLED</option>
              </>
            ) : (
              <>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REJECTED">REJECTED</option>
              </>
            )}
          </select>
        </div>
        <button className="btn btn-small" style={{ background:'#64748b' }} onClick={() => setStatusFilter('')}>
          Clear Filter
        </button>
        <span style={{ color:'#64748b', fontSize:'0.9rem', marginLeft:'auto' }}>
          {tab === 'bookings' ? filteredBookings.length : filteredTickets.length} result(s)
        </span>
      </div>

      {loading ? (
        <p className="loading-text">Loading data...</p>
      ) : tab === 'bookings' ? (
        <BookingList bookings={filteredBookings} onApprove={handleApprove} onReject={(id) => openRejectModal(id, 'booking')} showActions />
      ) : (
        /* Ticket management table */
        <div className="card" style={{ overflowX: 'auto' }}>
          {filteredTickets.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No tickets found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Category', 'Priority', 'Status', 'Resource', 'Reporter', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem' }}><strong>{ticket.category}</strong><br/><span style={{ fontSize:'0.8rem', color:'#94a3b8' }}>{ticket.description?.substring(0,60)}{ticket.description?.length > 60 ? '…' : ''}</span></td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                        background: ticket.priority === 'CRITICAL' ? '#fef2f2' : ticket.priority === 'HIGH' ? '#fff7ed' : '#f0fdf4',
                        color: ticket.priority === 'CRITICAL' ? '#dc2626' : ticket.priority === 'HIGH' ? '#ea580c' : '#16a34a' }}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                        background: TICKET_STATUS_COLORS[ticket.status] + '20',
                        color: TICKET_STATUS_COLORS[ticket.status] }}>
                        {ticket.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.85rem' }}>{ticket.resourceName || ticket.resourceId?.substring(0,8) || '—'}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.85rem' }}>{ticket.reporterId?.substring(0,8)}…</td>
                    <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.8rem' }}>{fmt(ticket.createdAt)}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {!ticket.assignedTo && ticket.status === 'OPEN' && (
                          <button className="btn btn-small" style={{ background: '#3b82f6' }}
                            onClick={() => handleAssignTicket(ticket.id)}>Assign Me</button>
                        )}
                        {TICKET_STATUS_FLOW[ticket.status]?.map(next => (
                          <button key={next} className="btn btn-small"
                            style={{ background: TICKET_STATUS_COLORS[next] }}
                            onClick={() => handleTicketStatus(ticket.id, next)}>
                            → {next.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                      {ticket.rejectionReason && (
                        <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                          Reason: {ticket.rejectionReason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
