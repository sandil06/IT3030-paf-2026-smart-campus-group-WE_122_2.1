import React from 'react';

const TYPE_LABELS = {
  LECTURE_HALL: '🏛 Lecture Hall',
  LAB:          '🔬 Lab',
  MEETING_ROOM: '🤝 Meeting Room',
  EQUIPMENT:    '🔧 Equipment',
  ROOM:         '🚪 Room',
};

const ResourceCard = ({ resource }) => {
  const typeLabel = TYPE_LABELS[resource.type] || resource.type;

  const availabilityText = resource.availability
    ? `${resource.availability.startTime || '—'} – ${resource.availability.endTime || '—'}`
    : null;

  return (
    <div className="card resource-card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div className="card-header">
        <div>
          <h3 style={{ color: '#1e3a8a', marginBottom: '0.2rem', fontSize: '1.05rem' }}>
            {resource.name}
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
            {typeLabel}
          </span>
        </div>
        <span className={`status-badge ${resource.bookable ? 'bg-approved' : 'bg-rejected'}`}>
          {resource.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: '#334155' }}>
        <p>📍 <strong>Location:</strong> {resource.location}</p>
        {resource.capacity && (
          <p>👥 <strong>Capacity:</strong> {resource.capacity} people</p>
        )}
        {availabilityText && (
          <p>🕐 <strong>Available:</strong> {availabilityText}</p>
        )}
        {resource.createdAt && (
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Added: {new Date(resource.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;
