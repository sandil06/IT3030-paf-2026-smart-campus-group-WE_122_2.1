import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import ResourceCard from '../components/ResourceCard';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering state — all applied client-side so no extra API calls on filter change
  const [typeFilter, setTypeFilter] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiService.getResources();
      setResources(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Auto-clear error
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 6000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const filteredResources = resources.filter(r => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (minCapacity && r.capacity < parseInt(minCapacity)) return false;
    if (locationFilter && !r.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    return true;
  });

  const clearFilters = () => {
    setTypeFilter('');
    setMinCapacity('');
    setLocationFilter('');
    setStatusFilter('');
  };

  const hasFilters = typeFilter || minCapacity || locationFilter || statusFilter;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.875rem' }}>
        <h2 style={{ color: '#1e3a8a', fontSize: '1.5rem', margin: 0 }}>Campus Resources</h2>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{resources.length} total</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter bar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Type</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="form-select" style={{ minWidth: '130px' }}>
            <option value="">All Types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
            <option value="ROOM">Room (Legacy)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select" style={{ minWidth: '130px' }}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Min Capacity</label>
          <input
            type="number"
            placeholder="e.g. 10"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            className="form-input"
            style={{ width: '110px' }}
            min="1"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Location</label>
          <input
            type="text"
            placeholder="Search location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="form-input"
            style={{ minWidth: '160px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {hasFilters && (
            <button className="btn btn-small" style={{ background: '#64748b' }} onClick={clearFilters}>
              Clear Filters
            </button>
          )}
          <button className="btn btn-small" style={{ background: '#475569' }} onClick={fetchResources} disabled={loading}>
            ↺ Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading resources...</p>
      ) : (
        <>
          {filteredResources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</p>
              <p>{hasFilters ? 'No resources match the current filters.' : 'No resources found.'}</p>
              {hasFilters && (
                <button className="btn btn-small" style={{ marginTop: '1rem', background: '#64748b' }} onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Showing {filteredResources.length} of {resources.length} resource{resources.length !== 1 ? 's' : ''}
              </p>
              <div className="grid">
                {filteredResources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Resources;
