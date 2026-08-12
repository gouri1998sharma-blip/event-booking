import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://event-booking-backend-a858.onrender.com/api/events')
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = e.venue.toLowerCase().includes(locationSearch.toLowerCase());
    
    const eDate = new Date(e.date);
    eDate.setHours(0, 0, 0, 0);
    const isActive = eDate >= today;

    if (filter === 'active') return matchesSearch && matchesLocation && isActive;
    return matchesSearch && matchesLocation;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#1E293B', paddingBottom: '4rem' }}>
      
      {/* HERO BANNER SECTION (MATCHING YOUR IMAGE EXACTLY) */}
      <div style={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 50%, #4C1D95 100%)',
        color: '#FFFFFF',
        padding: '3.5rem 2rem 5rem 2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* BIG CENTER CURVED DOME SHAPE (EXACT LIKE PICTURE) */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '75%',
          height: '140%',
          borderRadius: '0 0 100% 0',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.45) 0%, rgba(124, 58, 237, 0.8) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* CYAN CURVED WAVE BEHIND TOP RIGHT PICTURE */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '8%',
          width: '320px',
          height: '220px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.6) 0%, rgba(124, 58, 237, 0.0) 70%)',
          transform: 'rotate(-20deg)',
          filter: 'blur(20px)',
          pointerEvents: 'none'
        }} />

        {/* SMALL DECORATIVE PARTICLES / DOTS (RIGHT SIDE) */}
        <div style={{
          position: 'absolute',
          top: '35%',
          right: '3%',
          width: '60px',
          height: '60px',
          backgroundImage: 'radial-gradient(#C084FC 2px, transparent 2px)',
          backgroundSize: '12px 12px',
          opacity: 0.6,
          pointerEvents: 'none'
        }} />

        {/* MAIN HERO CONTENT */}
        <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 2 }}>
          
          {/* LEFT SIDE TEXT */}
          <div style={{ maxWidth: '580px' }}>
            <p style={{
              fontFamily: 'cursive, sans-serif',
              fontSize: '1.4rem',
              color: '#38BDF8', // Cyan Highlight
              margin: '0 0 0.5rem 0',
              fontWeight: '500'
            }}>
              Find Your Next Experience
            </p>

            <h1 style={{
              fontSize: '3.3rem',
              fontWeight: '800',
              lineHeight: '1.15',
              margin: '0 0 2rem 0',
              letterSpacing: '-0.5px'
            }}>
              Discover & Promote <br />
              Upcoming Event
            </h1>

            {/* COMBINED MULTI-INPUT SEARCH BAR (EXACT MATCH WITH IMAGE) */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '0.4rem 0.5rem 0.4rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              maxWidth: '620px',
              gap: '0.5rem'
            }}>
              {/* Event Name Input */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#7C3AED', fontSize: '1rem' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search Event" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    color: '#0F172A',
                    background: 'transparent'
                  }}
                />
              </div>

              <div style={{ width: '1px', height: '28px', background: '#E2E8F0' }} />

              {/* Location Input */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#7C3AED', fontSize: '1rem' }}>📍</span>
                <input 
                  type="text" 
                  placeholder="Search Location" 
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    color: '#0F172A',
                    background: 'transparent'
                  }}
                />
              </div>

              {/* Search Icon Button */}
              <button 
                style={{
                  background: '#312E81',
                  color: '#FFFFFF',
                  border: 'none',
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                🔍
              </button>
            </div>
          </div>

          {/* RIGHT SIDE STATIC GRAPHICS (NOT MOVING / NO ANIMATIONS) */}
          <div style={{ position: 'relative', width: '320px', height: '260px' }}>
            
            {/* Top Right Blob Image (STATIC) */}
            <div style={{
              position: 'absolute',
              top: '0',
              right: '25px',
              width: '135px',
              height: '135px',
              borderRadius: '60% 40% 70% 30% / 60% 30% 70% 40%',
              overflow: 'hidden',
              border: '3px solid #38BDF8',
              boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
              background: '#fff'
            }}>
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=80" alt="Audience" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Bottom Right Circle Image (STATIC) */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid #F59E0B',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              background: '#fff'
            }}>
              <img src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=300&q=80" alt="Speaker" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

          </div>

        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ maxWidth: '1100px', margin: '2.5rem auto 0 auto', padding: '0 1.5rem' }}>
        
        {/* FILTER BAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FFFFFF',
          padding: '0.9rem 1.4rem',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0F172A', fontWeight: '700' }}>Explore Events</h2>
          
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button 
              onClick={() => setFilter('all')}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '20px',
                border: 'none',
                background: filter === 'all' ? '#7C3AED' : '#F1F5F9',
                color: filter === 'all' ? '#FFFFFF' : '#64748B',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              All Events ({events.length})
            </button>
            <button 
              onClick={() => setFilter('active')}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '20px',
                border: 'none',
                background: filter === 'active' ? '#7C3AED' : '#F1F5F9',
                color: filter === 'active' ? '#FFFFFF' : '#64748B',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Upcoming 🚀
            </button>
          </div>
        </div>

        {/* CARDS GRID */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748B', marginTop: '3rem' }}>Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '1.1rem', color: '#64748B', margin: 0 }}>🔍 No events found matching your search.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.8rem'
          }}>
            {filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}