import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const BookingForm = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [form, setForm] = useState({
    resourceId: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: '',
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    apiService.getResources({ status: 'ACTIVE' })
      .then(res => setResources(res.data))
      .catch(() => {});
  }, []);

  const validate = () => {
    const newErrors = {};
    const now = new Date();

    if (!form.resourceId) newErrors.resourceId = 'Please select a resource.';
    if (!form.startTime) {
      newErrors.startTime = 'Start time is required.';
    } else if (new Date(form.startTime) <= now) {
      newErrors.startTime = 'Start time must be in the future.';
    }
    if (!form.endTime) {
      newErrors.endTime = 'End time is required.';
    } else if (form.startTime && new Date(form.endTime) <= new Date(form.startTime)) {
      newErrors.endTime = 'End time must be after start time.';
    }
    if (!form.purpose.trim()) newErrors.purpose = 'Purpose is required.';
    const attendeesNum = parseInt(form.attendees);
    if (!form.attendees || isNaN(attendeesNum) || attendeesNum < 1) {
      newErrors.attendees = 'Attendees must be at least 1.';
    } else if (selectedResource?.capacity && attendeesNum > selectedResource.capacity) {
      newErrors.attendees = `Exceeds resource capacity of ${selectedResource.capacity}.`;
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });
    setApiError('');
    setSuccess('');

    if (name === 'resourceId') {
      setSelectedResource(resources.find(r => r.id === value) || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setSuccess('');
    setApiError('');
    try {
      await apiService.createBooking({
        userId:     user.userId,
        resourceId: form.resourceId,
        startTime:  form.startTime,
        endTime:    form.endTime,
        purpose:    form.purpose,
        attendees:  parseInt(form.attendees),
      });
      setSuccess('✅ Booking submitted! Your request is now PENDING admin approval. You\'ll be notified once a decision is made.');
      setForm({ resourceId: '', startTime: '', endTime: '', purpose: '', attendees: '' });
      setSelectedResource(null);
      setErrors({});
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.resourceId && form.startTime && form.endTime && form.purpose.trim() &&
    parseInt(form.attendees) >= 1 &&
    new Date(form.startTime) > new Date() &&
    new Date(form.endTime) > new Date(form.startTime);

  const bookableResources = resources.filter(r => r.bookable !== false && r.status !== 'OUT_OF_SERVICE');

  return (
    <>
      {success  && <div className="alert alert-success">{success}</div>}
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form onSubmit={handleSubmit} className="card">
        {/* Resource Selector */}
        <div className="form-group">
          <label className="form-label">Resource *</label>
          <select name="resourceId" value={form.resourceId} onChange={handleChange} className="form-select">
            <option value="">— Select a bookable resource —</option>
            {bookableResources.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} · {r.type?.replace(/_/g, ' ')} · 📍 {r.location}
                {r.capacity ? ` · 👥 Capacity: ${r.capacity}` : ''}
              </option>
            ))}
          </select>
          {errors.resourceId && <span className="validation-error">{errors.resourceId}</span>}
          {bookableResources.length === 0 && (
            <span style={{ fontSize: '0.82rem', color: '#f59e0b', marginTop: '0.25rem', display: 'block' }}>
              No active resources available for booking.
            </span>
          )}
        </div>

        {/* Capacity info */}
        {selectedResource?.capacity && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem',
            padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#1e40af' }}>
            📊 This resource has a capacity of <strong>{selectedResource.capacity}</strong> people.
            Location: <strong>{selectedResource.location}</strong>
          </div>
        )}

        {/* Time range */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Start Date &amp; Time *</label>
            <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange}
              className="form-input" min={new Date().toISOString().slice(0, 16)} />
            {errors.startTime && <span className="validation-error">{errors.startTime}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">End Date &amp; Time *</label>
            <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange}
              className="form-input" min={form.startTime || new Date().toISOString().slice(0, 16)} />
            {errors.endTime && <span className="validation-error">{errors.endTime}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Purpose *</label>
          <input type="text" name="purpose" value={form.purpose} onChange={handleChange}
            className="form-input" placeholder="e.g. Team meeting, Lecture, Lab session..." />
          {errors.purpose && <span className="validation-error">{errors.purpose}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Number of Attendees *</label>
          <input type="number" name="attendees" value={form.attendees} onChange={handleChange}
            className="form-input" placeholder="e.g. 15" min="1"
            max={selectedResource?.capacity || undefined} />
          {errors.attendees && <span className="validation-error">{errors.attendees}</span>}
        </div>

        <button type="submit" className="btn" disabled={!isFormValid || loading}
          style={{ width: '100%', padding: '0.75rem' }}>
          {loading ? '⏳ Submitting...' : '📤 Submit Booking Request'}
        </button>

        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.75rem', textAlign: 'center' }}>
          Bookings require admin approval · You'll receive a notification once reviewed
        </p>
      </form>
    </>
  );
};

export default BookingForm;
