import React from 'react';
import { Link } from 'react-router-dom';

export default function EventCard({ event, isAdmin, onDelete, onUpdate }) {
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const isExpired = eventDate < today;

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* EXPIRED BADGE */}
      {isExpired && (
        <span style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: '#EF4444',
          color: '#FFF',
          padding: '0.25rem 0.6rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          zIndex: 2
        }}>
          Expired ✕
        </span>
      )}

      {/* BANNER IMAGE */}
      <img 
        src={event.bannerUrl || 'https://via.placeholder.com/300x160?text=Event+Banner'} 
        alt={event.title} 
        style={{ width: '100%', height: '160px', objectFit: 'cover' }}
      />

      {/* CONTENT */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.15rem', fontWeight: '700' }}>
          {event.title}
        </h3>

        <div style={{ color: '#64748B', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
          <span>📅 {new Date(event.date).toLocaleDateString()}</span>
          <span>📍 {event.venue || 'N/A'}</span>
          <span>🎟️ Available: <strong>{event.availableSeats} seats</strong></span>
        </div>

        {/* PRICE & BUTTONS ROW */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Price</span>
            <strong style={{ fontSize: '1.2rem', color: '#7C3AED' }}>₹{event.ticketPrice}</strong>
          </div>

          {/* ADMIN BUTTONS (EDIT & DELETE) */}
          {isAdmin ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => onUpdate(event)}
                style={{
                  padding: '0.45rem 0.8rem',
                  background: '#3B82F6',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                ✏️ Edit
              </button>

              <button 
                onClick={() => onDelete(event._id)}
                style={{
                  padding: '0.45rem 0.8rem',
                  background: '#EF4444',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                🗑️ Delete
              </button>
            </div>
          ) : (
            /* NORMAL USER BUTTON */
            isExpired ? (
              <button disabled style={{ padding: '0.5rem 1rem', background: '#E2E8F0', color: '#94A3B8', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                Closed
              </button>
            ) : (
              <Link to={`/event/${event._id}`} style={{ padding: '0.5rem 1rem', background: '#7C3AED', color: '#FFF', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.875rem' }}>
                Book Now
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}