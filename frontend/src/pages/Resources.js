import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService }  from '../services/api';
import StatusBadge     from '../components/StatusBadge';

const TYPE_ICONS = {
  LECTURE_HALL: '🏛',
  LAB:          '🔬',
  MEETING_ROOM: '🤝',
  EQUIPMENT:    '🔧',
  ROOM:         '🚪',
};

const Resources = () => {
  const navigate = useNavigate();
  const [resources,     setResources]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [typeFilter,    setTypeFilter]    = useState('');
  const [minCapacity,   setMinCapacity]   = useState('');
  const [locationFilter,setLocationFilter]= useState('');
  const [statusFilter,  setStatusFilter]  = useState('');

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const res = await apiService.getResources();
      setResources(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);
  useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 6000); return () => clearTimeout(t); } }, [error]);

  const filteredResources = resources.filter(r => {
    if (typeFilter     && r.type     !== typeFilter)                                      return false;
    if (statusFilter   && r.status   !== statusFilter)                                    return false;
    if (minCapacity    && r.capacity  < parseInt(minCapacity))                            return false;
    if (locationFilter && !r.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    return true;
  });

  const clearFilters = () => { setTypeFilter(''); setMinCapacity(''); setLocationFilter(''); setStatusFilter(''); };
  const hasFilters = typeFilter || minCapacity || locationFilter || statusFilter;

  return (
    <>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">🏛 Campus Resources</h1>
          <p className="page-subtitle">{resources.length} resources available to book</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchResources} disabled={loading}>
          {loading ? '…' : '↺ Refresh'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="form-group">
          <label className="form-label">Type</label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="form-select" style={{ minWidth: 140 }}>
            <option value="">All Types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
            <option value="ROOM">Room</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select" style={{ minWidth: 140 }}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Min Capacity</label>
          <input type="number" min="1" value={minCapacity} onChange={e => setMinCapacity(e.target.value)}
            className="form-input" placeholder="e.g. 10" style={{ width: 110 }} />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input type="text" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
            className="form-input" placeholder="Search location…" style={{ minWidth: 160 }} />
        </div>
        {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>✕ Clear</button>}
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.82rem', alignSelf: 'flex-end', paddingBottom: 2 }}>
          {filteredResources.length} of {resources.length}
        </span>
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <div className="cards-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton skel-card" />)}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p className="empty-text">
              {hasFilters ? 'No resources match the current filters.' : 'No resources found.'}
            </p>
            {hasFilters && <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={clearFilters}>Clear Filters</button>}
          </div>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredResources.map(r => (
            <div key={r.id} className="resource-card">
              {/* Type icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: r.status === 'ACTIVE' ? 'rgba(108,92,231,0.15)' : 'rgba(255,118,117,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', marginBottom: 12,
              }}>
                {TYPE_ICONS[r.type] || '🏢'}
              </div>

              {/* Name + status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {r.name}
                </h3>
                <StatusBadge status={r.status === 'ACTIVE' ? 'active' : 'oos'} />
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  📍 {r.location}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  🏷 {r.type?.replace(/_/g, ' ')}
                  {r.capacity && ` · 👥 ${r.capacity} seats`}
                </span>
                {r.availability?.startTime && (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    🕐 {r.availability.startTime} – {r.availability.endTime}
                  </span>
                )}
              </div>

              {/* CTA */}
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
                disabled={r.status !== 'ACTIVE'}
                onClick={() => navigate('/booking')}
                id={`book-resource-${r.id}`}
              >
                {r.status === 'ACTIVE' ? '📅 Book Now' : '🚫 Unavailable'}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Resources;
