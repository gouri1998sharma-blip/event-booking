import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = (user.role || '').toLowerCase() === 'admin';

  const [activeTab, setActiveTab] = useState('manage'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: '', description: '', venue: '', date: '', time: '',
    ticketPrice: '', totalSeats: '', availableSeats: '', bannerUrl: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const [eventsRes, bookingsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/events').catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/bookings', config).catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/users', config).catch(() => ({ data: [] }))
      ]);

      setEvents(eventsRes.data || []);
      setBookings(bookingsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // SMART PARTIAL TICKET CANCELLATION
  const handleCancelSeats = async (eventId, maxSeats) => {
    const inputCount = prompt(`You have ${maxSeats} seats booked for this event.\nHow many seats do you want to cancel?`, '1');
    if (!inputCount) return;

    const countToCancel = Number(inputCount);
    if (isNaN(countToCancel) || countToCancel <= 0) {
      alert('Please enter a valid number.');
      return;
    }

    if (countToCancel > maxSeats) {
      alert(`You can only cancel up to ${maxSeats} seats.`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/bookings/cancel-seats', {
        eventId,
        cancelCount: countToCancel
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Successfully cancelled ${countToCancel} seat(s)!`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel ticket.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const seatsCount = Number(eventForm.availableSeats) || Number(eventForm.totalSeats) || 0;
      
      const payload = {
        title: eventForm.title,
        description: eventForm.description || 'No description provided.',
        venue: eventForm.venue,
        date: eventForm.date,
        time: eventForm.time || '10:00 AM',
        ticketPrice: Number(eventForm.ticketPrice) || 0,
        totalSeats: seatsCount,
        availableSeats: seatsCount,
        bannerUrl: eventForm.bannerUrl
      };

      await axios.post('http://localhost:5000/api/events', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Event published successfully!');
      setEventForm({ title: '', description: '', venue: '', date: '', time: '', ticketPrice: '', totalSeats: '', availableSeats: '', bannerUrl: '' });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`http://localhost:5000/api/events/${eventId}`);
        alert('Event deleted successfully!');
        setEvents(events.filter(event => event._id !== eventId));
      } catch (err) {
        alert('Failed to delete event');
      }
    }
  };

  const handleOpenEdit = (event) => {
    const formattedDate = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
    setEditingEvent({ ...event, date: formattedDate });
  };

  const handleUpdateEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editingEvent,
        ticketPrice: Number(editingEvent.ticketPrice) || 0,
        availableSeats: Number(editingEvent.availableSeats) || 0,
        totalSeats: Number(editingEvent.totalSeats || editingEvent.availableSeats) || 0
      };

      await axios.put(`http://localhost:5000/api/events/${editingEvent._id}`, payload);
      alert('Event updated successfully!');
      setEditingEvent(null);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update event');
    }
  };

  // ADMIN GROUPING
  const adminGroupedBookings = bookings.reduce((acc, current) => {
    const userId = current.user?._id || current.user || current.userEmail || current.userName;
    const eventId = current.event?._id || current.event || current.eventTitle;
    const key = `${userId}_${eventId}`;

    const seats = Number(current.seatsBooked || current.seats || 1);
    const amount = Number(current.totalAmount || current.totalPrice || 0);

    if (acc[key]) {
      acc[key].seatsBooked += seats;
      acc[key].totalAmount += amount;
    } else {
      acc[key] = { ...current, seatsBooked: seats, totalAmount: amount };
    }
    return acc;
  }, {});

  const uniqueAdminBookings = Object.values(adminGroupedBookings);

  // USER GROUPING (STRICT GROUP BY EVENT)
  const rawMyBookings = bookings.filter(b => {
    const bookingUserId = b.user?._id || b.user;
    return bookingUserId === user.id || bookingUserId === user._id || b.user?.email === user.email;
  });

  const userGroupedBookings = rawMyBookings.reduce((acc, current) => {
    const eventId = current.event?._id || current.event || current.eventTitle || 'Unknown';
    const seats = Number(current.seatsBooked || current.seats || 1);
    const amount = Number(current.totalAmount || current.totalPrice || 0);

    if (acc[eventId]) {
      acc[eventId].seatsBooked += seats;
      acc[eventId].totalAmount += amount;
    } else {
      acc[eventId] = {
        ...current,
        eventId: current.event?._id || current.event,
        seatsBooked: seats,
        totalAmount: amount
      };
    }
    return acc;
  }, {});

  const groupedMyBookings = Object.values(userGroupedBookings);

  const totalRevenue = uniqueAdminBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalTickets = uniqueAdminBookings.reduce((sum, b) => sum + (b.seatsBooked || 0), 0);

  const filteredBookings = uniqueAdminBookings.filter(b => 
    (b.user?.name || b.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.user?.email || b.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.event?.title || b.eventTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#7C3AED', fontWeight: 'bold' }}>
        Loading Dashboard...
      </div>
    );
  }

  // USER VIEW
  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: '#F8FAFC', minHeight: '90vh' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#0F172A', fontSize: '2rem', fontWeight: '800', margin: 0 }}>
            Welcome, {user.name || 'User'} 👋
          </h1>
          <p style={{ color: '#64748B', marginTop: '0.3rem' }}>View and manage your booked tickets here</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.22)' }}>
            <span style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: '600' }}>Your Total Booked Events</span>
            <h2 style={{ fontSize: '2.2rem', margin: '0.4rem 0 0 0', fontWeight: '800' }}>{groupedMyBookings.length} Events</h2>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)' }}>
          <h2 style={{ margin: '0 0 1.2rem 0', fontSize: '1.3rem', color: '#0F172A', fontWeight: '700' }}>
            🎟️ My Booked Tickets
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.925rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                  <th style={{ padding: '0.85rem' }}>Event Title</th>
                  <th style={{ padding: '0.85rem' }}>Venue</th>
                  <th style={{ padding: '0.85rem' }}>Seats</th>
                  <th style={{ padding: '0.85rem' }}>Total Paid</th>
                  <th style={{ padding: '0.85rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {groupedMyBookings.length > 0 ? (
                  groupedMyBookings.map((b, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.85rem', color: '#0F172A', fontWeight: '700' }}>
                        {b.event?.title || b.eventTitle || 'Event'}
                      </td>
                      <td style={{ padding: '0.85rem', color: '#64748B' }}>
                        {b.event?.venue || 'Venue N/A'}
                      </td>
                      <td style={{ padding: '0.85rem', fontWeight: '700', color: '#0F172A' }}>
                        {b.seatsBooked} seats
                      </td>
                      <td style={{ padding: '0.85rem', fontWeight: '800', color: '#7C3AED' }}>
                        ₹{b.totalAmount}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <button 
                          onClick={() => handleCancelSeats(b.eventId || b.event?._id, b.seatsBooked)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#FEE2E2',
                            color: '#EF4444',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          ❌ Cancel Seats
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                      You haven't booked any tickets yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN VIEW
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: '#F8FAFC', minHeight: '90vh' }}>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0F172A', fontSize: '2rem', fontWeight: '800', margin: 0 }}>Admin Dashboard</h1>
        <p style={{ color: '#64748B', marginTop: '0.3rem' }}>Manage your events, sales, and platform metrics</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFFFFF', padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Revenue</span>
          <h2 style={{ fontSize: '2.2rem', margin: '0.4rem 0 0 0' }}>₹{totalRevenue}</h2>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: '#FFFFFF', padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Registered Users</span>
          <h2 style={{ fontSize: '2.2rem', margin: '0.4rem 0 0 0' }}>{users.length} Users</h2>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #4F46E5, #3730A3)', color: '#FFFFFF', padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Tickets Sold</span>
          <h2 style={{ fontSize: '2.2rem', margin: '0.4rem 0 0 0' }}>{totalTickets} Tickets</h2>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('manage')} style={{ padding: '0.65rem 1.25rem', borderRadius: '25px', border: 'none', background: activeTab === 'manage' ? '#7C3AED' : '#FFFFFF', color: activeTab === 'manage' ? '#FFFFFF' : '#64748B', fontWeight: '700', cursor: 'pointer' }}>
          📋 Manage Events ({events.length})
        </button>

        <button onClick={() => setActiveTab('create')} style={{ padding: '0.65rem 1.25rem', borderRadius: '25px', border: 'none', background: activeTab === 'create' ? '#7C3AED' : '#FFFFFF', color: activeTab === 'create' ? '#FFFFFF' : '#64748B', fontWeight: '700', cursor: 'pointer' }}>
          ➕ Create Event
        </button>

        <button onClick={() => setActiveTab('users')} style={{ padding: '0.65rem 1.25rem', borderRadius: '25px', border: 'none', background: activeTab === 'users' ? '#7C3AED' : '#FFFFFF', color: activeTab === 'users' ? '#FFFFFF' : '#64748B', fontWeight: '700', cursor: 'pointer' }}>
          👥 Users ({users.length})
        </button>

        <button onClick={() => setActiveTab('bookings')} style={{ padding: '0.65rem 1.25rem', borderRadius: '25px', border: 'none', background: activeTab === 'bookings' ? '#7C3AED' : '#FFFFFF', color: activeTab === 'bookings' ? '#FFFFFF' : '#64748B', fontWeight: '700', cursor: 'pointer' }}>
          🎟️ Bookings Summary
        </button>
      </div>

      {activeTab === 'manage' && (
        <div>
          <h2 style={{ color: '#0F172A', fontSize: '1.4rem', fontWeight: '700', marginBottom: '1.2rem' }}>
            📋 Manage & Edit Published Events
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {events.length > 0 ? (
              events.map(event => (
                <EventCard key={event._id} event={event} isAdmin={true} onDelete={handleDeleteEvent} onUpdate={handleOpenEdit} />
              ))
            ) : (
              <p style={{ color: '#64748B' }}>No events found to manage.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '2rem', border: '1px solid #E2E8F0', marginBottom: '3rem' }}>
          <h2 style={{ color: '#0F172A', fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem' }}>➕ Publish New Event</h2>
          <form onSubmit={handleCreateEvent} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Event Title</label>
              <input type="text" required placeholder="e.g. Tech Fest 2026" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Venue Location</label>
              <input type="text" required placeholder="e.g. Main Auditorium" value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Date</label>
              <input type="date" required value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Time</label>
              <input type="text" placeholder="e.g. 6:00 PM" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Ticket Price (₹)</label>
              <input type="number" required placeholder="100" value={eventForm.ticketPrice} onChange={(e) => setEventForm({ ...eventForm, ticketPrice: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Available Seats</label>
              <input type="number" required placeholder="100" value={eventForm.availableSeats} onChange={(e) => setEventForm({ ...eventForm, availableSeats: e.target.value, totalSeats: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Banner Image URL</label>
              <input type="url" placeholder="https://images.unsplash.com/photo-..." value={eventForm.bannerUrl} onChange={(e) => setEventForm({ ...eventForm, bannerUrl: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', boxSizing: 'border-box' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Event Description</label>
              <textarea rows="4" required placeholder="Enter detailed description..." value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" style={{ padding: '0.85rem 2rem', background: '#7C3AED', color: '#FFFFFF', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Publish Event</button>
            </div>
          </form>
        </div>
      )}

      {(activeTab === 'users' || activeTab === 'bookings') && (
        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '1.75rem', border: '1px solid #E2E8F0', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{activeTab === 'bookings' ? '🎟️ Ticket Sales Summary' : '👥 Registered Users'}</h2>
            <input type="text" placeholder="🔍 Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1.5px solid #CBD5E1' }} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            {activeTab === 'bookings' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '0.85rem' }}>User</th>
                    <th style={{ padding: '0.85rem' }}>Event Title</th>
                    <th style={{ padding: '0.85rem' }}>Seats</th>
                    <th style={{ padding: '0.85rem' }}>Total Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((b, idx) => (
                      <tr key={b._id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.85rem' }}><strong>{b.user?.name || b.userName || 'N/A'}</strong></td>
                        <td style={{ padding: '0.85rem' }}>{b.event?.title || b.eventTitle || 'Event'}</td>
                        <td style={{ padding: '0.85rem' }}>{b.seatsBooked} seats</td>
                        <td style={{ padding: '0.85rem', color: '#7C3AED', fontWeight: 'bold' }}>₹{b.totalAmount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No bookings found.</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '0.85rem' }}>Name</th>
                    <th style={{ padding: '0.85rem' }}>Email</th>
                    <th style={{ padding: '0.85rem' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u, idx) => (
                      <tr key={u._id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.85rem' }}>{u.name}</td>
                        <td style={{ padding: '0.85rem' }}>{u.email}</td>
                        <td style={{ padding: '0.85rem' }}><strong>{u.role || 'user'}</strong></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', padding: '2rem', borderRadius: '16px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0 }}>✏️ Edit Event Details</h2>
            <form onSubmit={handleUpdateEventSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Event Title</label>
                <input type="text" required value={editingEvent.title || ''} onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })} style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label>Venue Location</label>
                <input type="text" required value={editingEvent.venue || ''} onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })} style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label>Date</label>
                <input type="date" required value={editingEvent.date || ''} onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })} style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label>Time</label>
                <input type="text" value={editingEvent.time || ''} onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })} style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label>Ticket Price (₹)</label>
                <input type="number" required value={editingEvent.ticketPrice || 0} onChange={(e) => setEditingEvent({ ...editingEvent, ticketPrice: e.target.value })} style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label>Available Seats</label>
                <input type="number" required value={editingEvent.availableSeats || 0} onChange={(e) => setEditingEvent({ ...editingEvent, availableSeats: e.target.value })} style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Banner Image URL</label>
                <input type="url" value={editingEvent.bannerUrl || ''} onChange={(e) => setEditingEvent({ ...editingEvent, bannerUrl: e.target.value })} style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea rows="3" value={editingEvent.description || ''} onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })} style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', background: '#7C3AED', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Save Changes</button>
                <button type="button" onClick={() => setEditingEvent(null)} style={{ flex: 1, padding: '0.75rem', background: '#E2E8F0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}