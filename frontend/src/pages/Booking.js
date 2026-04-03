import React from 'react';
import BookingForm from '../components/BookingForm';

const Booking = () => {
  return (
    <div className="page">
      <h2 className="page-header">📅 Book a Resource</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: '560px' }}>
        Fill in the details below to reserve a campus resource. Your request will be reviewed
        and you'll be notified once it's approved or rejected.
      </p>
      <div style={{ maxWidth: '680px' }}>
        <BookingForm />
      </div>
    </div>
  );
};

export default Booking;
