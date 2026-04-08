import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth }    from '../contexts/AuthContext';
import StatusBadge    from '../components/StatusBadge';

const RESOURCE_TYPES = [
  { value: 'LECTURE_HALL', label: '🏛 Lecture Hall' },
  { value: 'LAB',          label: '🔬 Lab' },
  { value: 'MEETING_ROOM', label: '🤝 Meeting Room' },
  { value: 'EQUIPMENT',    label: '🔧 Equipment' },
];

const emptyForm = { name: '', type: '', capacity: '', location: '', availabilityStart: '', availabilityEnd: '', status: 'ACTIVE' };
const fmt = (dt) => dt ? new Date(dt).toLocaleDateString() : '—';

const ResourceManager = () => {
  const { isAdmin } = useAuth();
  const [resources,     setResources]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');
  const [form,          setForm]          = useState(emptyForm);
  const [formErrors,    setFormErrors]    = useState({});
  const [submitting,    setSubmitting]    = useState(false);
  const [editId,        setEditId]        = useState(null);
  const [showForm,      setShowForm]      = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchResources = useCallback(async () => {
    try { setLoading(true); const res = await apiService.getResources(); setResources(res.data); setError(''); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); } }, [success]);
  useEffect(() => { if (error)   { const t = setTimeout(() => setError(''),   7000); return () => clearTimeout(t); } }, [error]);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setFormErrors({ ...formErrors, [e.target.name]: '' }); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Name is required.';
    if (!form.type)            e.type     = 'Type is required.';
    if (!form.location.trim()) e.location = 'Location is required.';
    if (form.type !== 'EQUIPMENT' && (!form.capacity || parseInt(form.capacity) < 1)) e.capacity = 'Capacity ≥ 1 required.';
    if (form.availabilityStart && form.availabilityEnd && form.availabilityStart >= form.availabilityEnd) e.availabilityEnd = 'End must be after start.';
    return e;
  };

  const buildPayload = () => {
    const p = { name: form.name, type: form.type, location: form.location, status: form.status };
    if (form.capacity) p.capacity = parseInt(form.capacity);
    if (form.availabilityStart || form.availabilityEnd) p.availability = { startTime: form.availabilityStart || null, endTime: form.availabilityEnd || null };
    return p;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setFormErrors(ve); return; }
    setSubmitting(true);
    try {
      if (editId) { await apiService.updateResource(editId, buildPayload()); setSuccess('Resource updated.'); }
      else        { await apiService.createResource(buildPayload());          setSuccess('Resource created.'); }
      setForm(emptyForm); setEditId(null); setShowForm(false); setFormErrors({}); fetchResources();
    } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  };

  const handleEdit = (r) => {
    setForm({ name: r.name || '', type: r.type || '', capacity: r.capacity || '', location: r.location || '',
      availabilityStart: r.availability?.startTime || '', availabilityEnd: r.availability?.endTime || '', status: r.status || 'ACTIVE' });
    setEditId(r.id); setFormErrors({}); setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleCancelEdit = () => { setForm(emptyForm); setEditId(null); setFormErrors({}); setShowForm(false); };

  const handleDelete = async (id) => {
    try { await apiService.deleteResource(id); setSuccess('Resource deleted.'); setDeleteConfirm(null); fetchResources(); }
    catch (err) { setError(err.message); setDeleteConfirm(null); }
  };

  const handleToggleStatus = async (r) => {
    const newStatus = r.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    try { await apiService.updateResource(r.id, { status: newStatus }); setSuccess(`Marked as ${newStatus.replace('_', ' ')}.`); fetchResources(); }
    catch (err) { setError(err.message); }
  };

  if (!isAdmin) return (
    <div className="access-denied-page">
      <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔒</div>
      <h1>Admin Access Required</h1>
      <p>Only administrators can manage campus resources.</p>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">🔧 Resource Management</h1>
          <p className="page-subtitle">{resources.length} campus resource{resources.length !== 1 ? 's' : ''} registered</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)} id="add-resource-btn">+ Add Resource</button>
        )}
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">🗑 Delete Resource?</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 4, fontSize: '0.875rem' }}>
              This will permanently delete <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.name}</strong>.
              Existing bookings referencing this resource will become orphaned.
            </p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
              <button className="btn btn-ghost"  onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="glass-card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
            {editId ? '✏️ Edit Resource' : '➕ New Resource'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="two-col">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="e.g. Lab 101" />
                {formErrors.name && <span className="validation-error">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select name="type" value={form.type} onChange={handleChange} className="form-select">
                  <option value="">Select type…</option>
                  {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {formErrors.type && <span className="validation-error">{formErrors.type}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input name="location" value={form.location} onChange={handleChange} className="form-input" placeholder="e.g. Building 2, Floor 3" />
                {formErrors.location && <span className="validation-error">{formErrors.location}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Capacity {form.type === 'EQUIPMENT' ? <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(N/A)</span> : '*'}</label>
                <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange}
                  className="form-input" placeholder="e.g. 30" disabled={form.type === 'EQUIPMENT'} />
                {formErrors.capacity && <span className="validation-error">{formErrors.capacity}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Availability Start (optional)</label>
                <input name="availabilityStart" type="time" value={form.availabilityStart} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Availability End (optional)</label>
                <input name="availabilityEnd" type="time" value={form.availabilityEnd} onChange={handleChange} className="form-input" />
                {formErrors.availabilityEnd && <span className="validation-error">{formErrors.availabilityEnd}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="form-select">
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : (editId ? 'Update Resource' : 'Create Resource')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleCancelEdit}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Resource Table */}
      {loading ? (
        <div className="table-wrap">
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[85, 70, 90, 75, 80].map((w, i) => <div key={i} className="skeleton skel-text" style={{ width: `${w}%` }} />)}
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-icon">🏫</div>
            <p className="empty-text">No resources yet. Click "Add Resource" to create the first one.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Availability</th>
                <th>Status</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.name}</strong></td>
                  <td>{r.type?.replace(/_/g, ' ')}</td>
                  <td>{r.location}</td>
                  <td style={{ textAlign: 'center' }}>{r.capacity ?? '—'}</td>
                  <td>{r.availability ? `${r.availability.startTime || '?'} – ${r.availability.endTime || '?'}` : '—'}</td>
                  <td><StatusBadge status={r.status === 'ACTIVE' ? 'active' : 'oos'} /></td>
                  <td>{fmt(r.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(r)}>Edit</button>
                      <button
                        className={`btn btn-xs ${r.status === 'ACTIVE' ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(r)}
                      >
                        {r.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-danger btn-xs" onClick={() => setDeleteConfirm(r)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default ResourceManager;
