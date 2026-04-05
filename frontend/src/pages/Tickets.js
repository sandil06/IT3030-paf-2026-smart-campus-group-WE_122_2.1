import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TicketForm from '../components/TicketForm';

const PRIORITY_COLORS = {
  LOW: '#64748b', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#7c3aed',
};
const STATUS_COLORS = {
  OPEN: '#3b82f6', IN_PROGRESS: '#f59e0b', RESOLVED: '#10b981', CLOSED: '#64748b', REJECTED: '#ef4444',
};

// Matches backend VALID_TRANSITIONS map
const STATUS_TRANSITIONS = {
  OPEN:        ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['REJECTED'],   // resolve uses modal with notes
  RESOLVED:    ['CLOSED'],
  CLOSED:      [],
  REJECTED:    [],
};

const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';

const Tickets = () => {
  const { user, isAdmin } = useAuth();
  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [comment,  setComment]  = useState({});         // ticketId → new comment text
  const [editingComment, setEditingComment] = useState(null); // { ticketId, commentId, text }
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [filterStatus,   setFilterStatus]   = useState('');

  // Modals
  const [rejectModal,  setRejectModal]  = useState({ open: false, ticketId: null, reason: '' });
  const [resolveModal, setResolveModal] = useState({ open: false, ticketId: null, notes: '' });

  const fetchTickets = useCallback(async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const res = isAdmin
        ? await apiService.getAllTickets()
        : await apiService.getUserTickets(user.userId);
      setTickets(res.data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user?.userId]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error)   { const t = setTimeout(() => setError(''),   6000); return () => clearTimeout(t); }
  }, [error]);

  // ── Status transitions ────────────────────────────────────────────────────
  const handleAdvanceStatus = async (ticketId, nextStatus) => {
    try {
      await apiService.updateTicketStatus(ticketId, nextStatus);
      setSuccess(`Ticket moved to ${nextStatus}.`);
      fetchTickets();
    } catch (err) { setError(err.message); }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.reason.trim()) { setError('Rejection reason is required.'); return; }
    try {
      await apiService.updateTicketStatus(rejectModal.ticketId, 'REJECTED', rejectModal.reason);
      setSuccess('Ticket rejected.');
      setRejectModal({ open: false, ticketId: null, reason: '' });
      fetchTickets();
    } catch (err) { setError(err.message); }
  };

  const handleResolveConfirm = async () => {
    try {
      await apiService.resolveTicket(resolveModal.ticketId, resolveModal.notes);
      setSuccess('Ticket resolved.');
      setResolveModal({ open: false, ticketId: null, notes: '' });
      fetchTickets();
    } catch (err) { setError(err.message); }
  };

  // ── Comments ──────────────────────────────────────────────────────────────
  const handleAddComment = async (ticketId) => {
    const text = comment[ticketId]?.trim();
    if (!text) return;
    try {
      await apiService.addTicketComment(ticketId, user.userId, text);
      setComment({ ...comment, [ticketId]: '' });
      setSuccess('Comment added.');
      fetchTickets();
    } catch (err) { setError(err.message); }
  };

  const handleEditComment = async () => {
    if (!editingComment?.text?.trim()) { setError('Comment cannot be empty.'); return; }
    try {
      await apiService.editTicketComment(editingComment.ticketId, editingComment.commentId, editingComment.text);
      setEditingComment(null);
      setSuccess('Comment updated.');
      fetchTickets();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteComment = async (ticketId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await apiService.deleteTicketComment(ticketId, commentId);
      fetchTickets();
    } catch (err) { setError(err.message); }
  };

  const filtered = filterStatus ? tickets.filter(t => t.status === filterStatus) : tickets;

  return (
    <div className="page">
      <h2 className="page-header">🎫 Support Tickets</h2>

      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
          <div className="card" style={{ maxWidth:'440px', width:'90%', margin:0 }}>
            <h3 style={{ marginBottom:'1rem' }}>❌ Reject Ticket</h3>
            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <textarea className="form-textarea" rows="3" placeholder="Reason for rejection..."
                value={rejectModal.reason}
                onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })} autoFocus />
            </div>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button className="btn btn-danger" onClick={handleRejectConfirm}>Confirm Reject</button>
              <button className="btn" style={{ background:'#64748b' }} onClick={() => setRejectModal({ open:false, ticketId:null, reason:'' })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal.open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
          <div className="card" style={{ maxWidth:'440px', width:'90%', margin:0 }}>
            <h3 style={{ marginBottom:'1rem' }}>✅ Resolve Ticket</h3>
            <div className="form-group">
              <label className="form-label">Resolution Notes (optional)</label>
              <textarea className="form-textarea" rows="3" placeholder="What was done to fix the issue?"
                value={resolveModal.notes}
                onChange={e => setResolveModal({ ...resolveModal, notes: e.target.value })} autoFocus />
            </div>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button className="btn" style={{ background:'#10b981' }} onClick={handleResolveConfirm}>Mark Resolved</button>
              <button className="btn" style={{ background:'#64748b' }} onClick={() => setResolveModal({ open:false, ticketId:null, notes:'' })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Comment Modal */}
      {editingComment && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
          <div className="card" style={{ maxWidth:'440px', width:'90%', margin:0 }}>
            <h3 style={{ marginBottom:'1rem' }}>✏️ Edit Comment</h3>
            <textarea className="form-textarea" rows="3"
              value={editingComment.text}
              onChange={e => setEditingComment({ ...editingComment, text: e.target.value })} autoFocus />
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1rem' }}>
              <button className="btn" onClick={handleEditComment}>Save Changes</button>
              <button className="btn" style={{ background:'#64748b' }} onClick={() => setEditingComment(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Submit new ticket */}
      <TicketForm onSuccess={() => { setSuccess('✅ Ticket submitted successfully!'); fetchTickets(); }} />

      {/* Filter + list header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'2rem 0 1rem', flexWrap:'wrap', gap:'0.75rem' }}>
        <h3 style={{ margin:0 }}>
          {isAdmin ? 'All Tickets' : 'My Tickets'}
          <span style={{ fontSize:'0.9rem', fontWeight:400, color:'#64748b', marginLeft:'0.5rem' }}>
            ({filtered.length} of {tickets.length})
          </span>
        </h3>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width:'auto', minWidth:'160px' }}>
          <option value="">All Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading tickets...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'2.5rem', color:'#94a3b8' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🎫</div>
          <p>No tickets found.</p>
        </div>
      ) : (
        <div>
          {filtered.map(ticket => (
            <div key={ticket.id} className="card" style={{ marginBottom:'1rem' }}>
              {/* Header row */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
                  <span style={{
                    padding:'0.2rem 0.6rem', borderRadius:'4px', fontSize:'0.75rem', fontWeight:700,
                    background: PRIORITY_COLORS[ticket.priority] + '20', color: PRIORITY_COLORS[ticket.priority],
                    border: `1px solid ${PRIORITY_COLORS[ticket.priority]}40`,
                  }}>
                    {ticket.priority}
                  </span>
                  <strong style={{ color:'#1e3a8a' }}>{ticket.category}</strong>
                  <span style={{ color:'#94a3b8', fontSize:'0.8rem' }}>#{ticket.id?.slice(-8)}</span>
                  {ticket.resourceName && (
                    <span style={{ fontSize:'0.8rem', color:'#64748b' }}>📍 {ticket.resourceName}</span>
                  )}
                </div>
                <span style={{
                  padding:'0.25rem 0.7rem', borderRadius:'9999px', fontSize:'0.75rem', fontWeight:700,
                  background: STATUS_COLORS[ticket.status] + '20', color: STATUS_COLORS[ticket.status],
                }}>
                  {ticket.status?.replace('_', ' ')}
                </span>
              </div>

              <p style={{ margin:'0.75rem 0', color:'#334155', lineHeight:1.6 }}>{ticket.description}</p>

              {/* Rejection reason */}
              {ticket.rejectionReason && (
                <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'6px', padding:'0.5rem 0.75rem', marginBottom:'0.5rem' }}>
                  <small style={{ color:'#ef4444' }}><strong>Rejection Reason:</strong> {ticket.rejectionReason}</small>
                </div>
              )}

              {/* Resolution notes */}
              {ticket.resolutionNotes && (
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'6px', padding:'0.5rem 0.75rem', marginBottom:'0.5rem' }}>
                  <small style={{ color:'#16a34a' }}><strong>✅ Resolution Notes:</strong> {ticket.resolutionNotes}</small>
                </div>
              )}

              {/* Attachments */}
              {ticket.attachments?.length > 0 && (
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.75rem' }}>
                  {ticket.attachments.map((url, i) => (
                    <a key={i} href={`http://localhost:9090${url}`} target="_blank" rel="noreferrer">
                      <img src={`http://localhost:9090${url}`} alt={`attachment-${i}`}
                        style={{ width:'70px', height:'70px', objectFit:'cover', borderRadius:'6px', border:'1px solid #e2e8f0' }}
                        onError={e => { e.target.style.display='none'; }}
                      />
                    </a>
                  ))}
                </div>
              )}

              {/* Meta + actions */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem' }}>
                <small style={{ color:'#94a3b8', fontSize:'0.78rem' }}>
                  Created: {fmt(ticket.createdAt)}
                  {ticket.assignedTo && ' · Assigned ✓'}
                </small>
                <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                  <button className="btn btn-small" style={{ background:'#475569' }}
                    onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}>
                    {expandedTicket === ticket.id ? 'Hide Comments' : `💬 Comments (${ticket.comments?.length || 0})`}
                  </button>

                  {/* Admin status transitions */}
                  {isAdmin && (STATUS_TRANSITIONS[ticket.status] || []).map(next => (
                    <button key={next} className={`btn btn-small ${next === 'REJECTED' ? 'btn-danger' : ''}`}
                      style={{ background: next === 'REJECTED' ? '#ef4444' : '#475569' }}
                      onClick={() => next === 'REJECTED'
                        ? setRejectModal({ open:true, ticketId:ticket.id, reason:'' })
                        : handleAdvanceStatus(ticket.id, next)
                      }>
                      → {next.replace('_', ' ')}
                    </button>
                  ))}
                  {/* Resolve button (IN_PROGRESS) */}
                  {isAdmin && ticket.status === 'IN_PROGRESS' && (
                    <button className="btn btn-small" style={{ background:'#10b981' }}
                      onClick={() => setResolveModal({ open:true, ticketId:ticket.id, notes:'' })}>
                      ✅ Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Comments section */}
              {expandedTicket === ticket.id && (
                <div style={{ marginTop:'1rem', borderTop:'1px solid #e2e8f0', paddingTop:'1rem' }}>
                  <h4 style={{ marginBottom:'0.75rem', color:'#475569' }}>
                    Comments ({ticket.comments?.length || 0})
                  </h4>
                  {ticket.comments?.length > 0 ? ticket.comments.map(c => (
                    <div key={c.id} style={{ background:'#f8fafc', padding:'0.75rem', borderRadius:'6px', marginBottom:'0.5rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.25rem' }}>
                        <small style={{ fontWeight:600, color:'#1e3a8a' }}>
                          {c.authorId === user.userId ? 'You' : `User …${c.authorId?.slice(-6)}`}
                        </small>
                        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                          <small style={{ color:'#94a3b8' }}>{fmt(c.createdAt)}</small>
                          {c.authorId === user.userId && (
                            <>
                              <button onClick={() => setEditingComment({ ticketId: ticket.id, commentId: c.id, text: c.content })}
                                style={{ background:'none', border:'none', cursor:'pointer', color:'#3b82f6', fontSize:'0.75rem' }}>
                                ✏️
                              </button>
                              <button onClick={() => handleDeleteComment(ticket.id, c.id)}
                                style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:'0.75rem' }}>
                                🗑
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p style={{ margin:0, fontSize:'0.9rem', color:'#334155' }}>{c.content}</p>
                    </div>
                  )) : (
                    <p style={{ color:'#94a3b8', fontSize:'0.85rem' }}>No comments yet. Be the first to comment.</p>
                  )}

                  {/* Add comment — not for closed/rejected */}
                  {ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                    <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.75rem' }}>
                      <input type="text" className="form-input" style={{ flex:1 }}
                        placeholder="Write a comment..."
                        value={comment[ticket.id] || ''}
                        onChange={e => setComment({ ...comment, [ticket.id]: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleAddComment(ticket.id)}
                      />
                      <button className="btn btn-small" style={{ whiteSpace:'nowrap' }}
                        onClick={() => handleAddComment(ticket.id)}
                        disabled={!comment[ticket.id]?.trim()}>
                        Post
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;
