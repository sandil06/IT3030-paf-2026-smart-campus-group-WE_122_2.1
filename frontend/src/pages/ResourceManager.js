import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RESOURCE_TYPES = [
  { value: 'LECTURE_HALL', label: '🏛 Lecture Hall' },
  { value: 'LAB',          label: '🔬 Lab' },
  { value: 'MEETING_ROOM', label: '🤝 Meeting Room' },
  { value: 'EQUIPMENT',    label: '🔧 Equipment' },
];

const emptyForm = {
  name: '',
  type: '',
  capacity: '',
  location: '',
  availabilityStart: '',
  availabilityEnd: '',
  status: 'ACTIVE',
};

const fmt = (dt) => dt ? new Date(dt).toLocaleDateString() : '—';

const ResourceManager = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { isAdmin } = useAuth();

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getResources();
      setResources(res.data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error)   { const t = setTimeout(() => setError(''), 7000);   return () => clearTimeout(t); }
  }, [error]);

  // ── Form handling ────────────────────────────────────────────────────────

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Name is required.';
    if (!form.type)            e.type     = 'Type is required.';
    if (!form.location.trim()) e.location = 'Location is required.';
    const needsCapacity = form.type && form.type !== 'EQUIPMENT';
    if (needsCapacity && (!form.capacity || parseInt(form.capacity) < 1)) {
      e.capacity = 'Capacity is required and must be ≥ 1 for this type.';
    }
    if (form.availabilityStart && form.availabilityEnd) {
      if (form.availabilityStart >= form.availabilityEnd) {
        e.availabilityEnd = 'End time must be after start time.';
      }
    }
    return e;
  };

  const buildPayload = () => {
    const payload = {
      name: form.name,
      type: form.type,
      location: form.location,
      status: form.status,
    };
    if (form.capacity) payload.capacity = parseInt(form.capacity);
    if (form.availabilityStart || form.availabilityEnd) {
      payload.availability = {
        startTime: form.availabilityStart || null,
        endTime: form.availabilityEnd || null,
      };
    }
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      if (editId) {
        await apiService.updateResource(editId, buildPayload());
        setSuccess('Resource updated successfully.');
      } else {
        await apiService.createResource(buildPayload());
        setSuccess('Resource created successfully.');
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      setErrors({});
      fetchResources();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (resource) => {
    setForm({
      name: resource.name || '',
      type: resource.type || '',
      capacity: resource.capacity || '',
      location: resource.location || '',
      availabilityStart: resource.availability?.startTime || '',
      availabilityEnd:   resource.availability?.endTime || '',
      status: resource.status || 'ACTIVE',
    });
    setEditId(resource.id);
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setForm(emptyForm);
    setEditId(null);
    setErrors({});
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteResource(id);
      setSuccess('Resource deleted.');
      setDeleteConfirm(null);
      fetchResources();
    } catch (err) {
      setError(err.message);
      setDeleteConfirm(null);
    }
  };

  const handleToggleStatus = async (resource) => {
    const newStatus = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    try {
      await apiService.updateResource(resource.id, { status: newStatus });
      setSuccess(`Resource marked as ${newStatus.replace('_', ' ')}.`);
      fetchResources();
    } catch (err) {
      setError(err.message);
    }
  };

  const needsCapacity = form.type && form.type !== 'EQUIPMENT';

  // ── Render ────────────────────────────────────────────────────────────────

  if (!isAdmin) {
    return (
      <div className="page">
        <p style={{ color: '#ef4444', textAlign: 'center', padding: '3rem' }}>
          🔒 Admin access required to manage resources.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.875rem' }}>
        <h2 style={{ color: '#1e3a8a', fontSize: '1.5rem', margin: 0 }}>
          Resource Management
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{resources.length} resource{resources.length !== 1 ? 's' : ''}</span>
          {!showForm && (
            <button className="btn" onClick={() => setShowForm(true)}>
              + Add Resource
            </button>
          )}
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%', margin: 0 }}>
            <h3 style={{ marginBottom: '0.75rem', color: '#ef4444' }}>Delete Resource?</h3>
            <p style={{ color: '#334155', marginBottom: '1.25rem' }}>
              This will permanently delete <strong>{deleteConfirm.name}</strong>. Existing bookings referencing this resource will become orphaned.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
              <button className="btn" style={{ background: '#64748b' }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: '#1e3a8a' }}>
            {editId ? '✏️ Edit Resource' : '➕ New Resource'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="e.g. Lab 101" />
              {errors.name && <span className="validation-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className="form-select">
                <option value="">Select type...</option>
                {RESOURCE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.type && <span className="validation-error">{errors.type}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <input name="location" value={form.location} onChange={handleChange} className="form-input" placeholder="e.g. Building 2, Floor 3" />
              {errors.location && <span className="validation-error">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Capacity {needsCapacity ? '*' : <span style={{ fontWeight: 400, color: '#94a3b8' }}>(N/A for equipment)</span>}
              </label>
              <input
                name="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 30"
                disabled={form.type === 'EQUIPMENT'}
              />
              {errors.capacity && <span className="validation-error">{errors.capacity}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Availability Start (optional)</label>
              <input name="availabilityStart" type="time" value={form.availabilityStart} onChange={handleChange} className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Availability End (optional)</label>
              <input name="availabilityEnd" type="time" value={form.availabilityEnd} onChange={handleChange} className="form-input" />
              {errors.availabilityEnd && <span className="validation-error">{errors.availabilityEnd}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="form-select">
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Saving...' : (editId ? 'Update Resource' : 'Create Resource')}
            </button>
            <button type="button" className="btn" style={{ background: '#64748b' }} onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Resource Table */}
      {loading ? (
        <p className="loading-text">Loading resources...</p>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <p style={{ fontSize: '1.5rem' }}>🏫</p>
          <p>No resources yet. Click "Add Resource" to get started.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
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
                  <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{r.name}</td>
                  <td style={{ fontSize: '0.85rem' }}>{r.type?.replace('_', ' ')}</td>
                  <td>{r.location}</td>
                  <td style={{ textAlign: 'center' }}>{r.capacity ?? '—'}</td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {r.availability
                      ? `${r.availability.startTime || '?'} – ${r.availability.endTime || '?'}`
                      : '—'}
                  </td>
                  <td>
                    <span className={`status-badge ${r.bookable ? 'bg-approved' : 'bg-rejected'}`}>
                      {r.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{fmt(r.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-small" style={{ background: '#475569' }} onClick={() => handleEdit(r)}>
                        Edit
                      </button>
                      <button
                        className={`btn btn-small ${r.status === 'ACTIVE' ? '' : 'btn-success'}`}
                        style={r.status === 'ACTIVE' ? { background: '#f59e0b' } : {}}
                        onClick={() => handleToggleStatus(r)}
                        title={r.status === 'ACTIVE' ? 'Mark Out of Service' : 'Mark Active'}
                      >
                        {r.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-small btn-danger" onClick={() => setDeleteConfirm(r)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
