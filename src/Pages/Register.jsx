import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('https://event-booking-backend-a858.onrender.com/api/auth/register', formData);
      alert('Registration Successful! Please Login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const roleLabels = {
    user: 'User (Book Tickets)',
    admin: 'Admin / Event Organizer'
  };

  return (
    <div style={{ minHeight: '88vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', borderRadius: '18px', background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px rgba(124, 58, 237, 0.08)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: '#fff', fontSize: '1.8rem', fontWeight: '900', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem auto' }}>
            e
          </div>
          <h2 style={{ color: '#0F172A', margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>Create EventPlace Account</h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.3rem' }}>Join to book or organize events</p>
        </div>

        {error && <p style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', color: '#0F172A', fontWeight: '600' }}>Full Name</label>
            <input 
              type="text" 
              required 
              placeholder="John Doe"
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', color: '#0F172A', fontWeight: '600' }}>Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="name@example.com"
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', color: '#0F172A', fontWeight: '600' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                placeholder="••••••••"
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 2.8rem 0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
                onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          {/* CUSTOM PURPLE DROPDOWN (NO BLUE HIGHLIGHT ISSUE) */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <label style={{ display: 'block', marginBottom: '0.35rem', color: '#0F172A', fontWeight: '600' }}>Account Role</label>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                borderRadius: '10px', 
                border: `1.5px solid ${isDropdownOpen ? '#7C3AED' : '#CBD5E1'}`, 
                fontSize: '0.95rem', 
                background: '#FFFFFF',
                color: '#0F172A',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxSizing: 'border-box'
              }}
            >
              <span>{roleLabels[formData.role]}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748B', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
            </div>

            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '105%',
                left: 0,
                right: 0,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                zIndex: 100,
                overflow: 'hidden'
              }}>
                <div 
                  onClick={() => { setFormData({ ...formData, role: 'user' }); setIsDropdownOpen(false); }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    background: formData.role === 'user' ? '#7C3AED' : '#FFFFFF',
                    color: formData.role === 'user' ? '#FFFFFF' : '#0F172A',
                    fontWeight: formData.role === 'user' ? '600' : 'normal',
                    fontSize: '0.95rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.role !== 'user') e.currentTarget.style.background = '#F1F5F9';
                  }}
                  onMouseLeave={(e) => {
                    if (formData.role !== 'user') e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  User (Book Tickets)
                </div>
                <div 
                  onClick={() => { setFormData({ ...formData, role: 'admin' }); setIsDropdownOpen(false); }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    background: formData.role === 'admin' ? '#7C3AED' : '#FFFFFF',
                    color: formData.role === 'admin' ? '#FFFFFF' : '#0F172A',
                    fontWeight: formData.role === 'admin' ? '600' : 'normal',
                    fontSize: '0.95rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.role !== 'admin') e.currentTarget.style.background = '#F1F5F9';
                  }}
                  onMouseLeave={(e) => {
                    if (formData.role !== 'admin') e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  Admin / Event Organizer
                </div>
              </div>
            )}
          </div>

          <button type="submit" style={{ padding: '0.85rem', background: '#7C3AED', color: '#FFFFFF', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '0.5rem', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>
            Register Account
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}