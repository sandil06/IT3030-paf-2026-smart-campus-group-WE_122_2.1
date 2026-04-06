import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TicketForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({
    category: '',
    priority: '',
    description: '',
    resourceId: '',
  });
  const [files, setFiles]       = useState([]); // up to 3 image files
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    apiService.getResources()
      .then(res => setResources(res.data))
      .catch(() => {});
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.category)          newErrors.category    = 'Category is required.';
    if (!form.priority)          newErrors.priority    = 'Priority is required.';
    if (!form.description.trim()) newErrors.description = 'Description is required.';
    if (files.length > 3)        newErrors.files       = 'Maximum 3 images allowed.';
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 3) {
      setErrors({ ...errors, files: 'Maximum 3 images allowed.' });
      return;
    }
    setFiles(selected);
    setErrors({ ...errors, files: '' });
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await apiService.createTicket({
        reporterId:  user.userId,
        category:    form.category,
        priority:    form.priority,
        description: form.description,
        ...(form.resourceId ? { resourceId: form.resourceId } : {}),
      });

      // Upload attachments sequentially if any
      if (files.length > 0 && res.data?.id) {
        for (const file of files) {
          await apiService.uploadTicketAttachment(res.data.id, file);
        }
      }

      setForm({ category: '', priority: '', description: '', resourceId: '' });
      setFiles([]);
      setErrors({});
      if (fileRef.current) fileRef.current.value = '';
      if (onSuccess) onSuccess();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.category && form.priority && form.description.trim();

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 style={{ marginBottom: '1.5rem' }}>🎫 Submit New Ticket</h3>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select name="category" value={form.category} onChange={handleChange} className="form-select">
            <option value="">Select category...</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="IT_SUPPORT">IT Support</option>
            <option value="CLEANING">Cleaning</option>
            <option value="SECURITY">Security</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.category && <span className="validation-error">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Priority *</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="form-select">
            <option value="">Select priority...</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          {errors.priority && <span className="validation-error">{errors.priority}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Affected Resource (optional)</label>
        <select name="resourceId" value={form.resourceId} onChange={handleChange} className="form-select">
          <option value="">— None / Not applicable —</option>
          {resources.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.type}) — {r.location}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="form-textarea"
          rows="4"
          placeholder="Describe the issue in detail..."
        />
        {errors.description && <span className="validation-error">{errors.description}</span>}
      </div>

      {/* Image Attachments */}
      <div className="form-group">
        <label className="form-label">
          📷 Attachments (optional, max 3 images)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{
            display: 'block', padding: '0.5rem', border: '1px dashed #cbd5e1',
            borderRadius: '0.5rem', width: '100%', cursor: 'pointer', background: '#f8fafc',
          }}
        />
        {errors.files && <span className="validation-error">{errors.files}</span>}
        {files.length > 0 && (
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {files.map((file, i) => (
              <div key={i} style={{
                position: 'relative', display: 'inline-block',
                border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden',
              }}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${i}`}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', display: 'block' }}
                />
                <button type="button" onClick={() => handleRemoveFile(i)}
                  style={{
                    position: 'absolute', top: '2px', right: '2px',
                    background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
                    borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.7rem',
                  }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="btn" disabled={!isFormValid || loading}
        style={{ width: '100%' }}>
        {loading ? '⏳ Submitting...' : '📤 Submit Ticket'}
      </button>
    </form>
  );
};

export default TicketForm;
