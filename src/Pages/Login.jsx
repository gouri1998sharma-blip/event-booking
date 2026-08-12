import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('https://event-booking-backend-a858.onrender.com/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
      window.location.reload(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '88vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', borderRadius: '18px', background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px rgba(124, 58, 237, 0.08)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: '#fff', fontSize: '1.8rem', fontWeight: '900', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem auto' }}>
            e
          </div>
          <h2 style={{ color: '#0F172A', margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>Welcome to EventPlace</h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.3rem' }}>Sign in to manage your bookings</p>
        </div>

        {error && <p style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#0F172A', fontWeight: '600' }}>Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="name@example.com"
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#0F172A', fontWeight: '600' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                placeholder="••••••••"
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: '0.8rem 2.8rem 0.8rem 1rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.95rem' }}
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

          <button type="submit" style={{ padding: '0.85rem', background: '#7C3AED', color: '#FFFFFF', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '0.5rem', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>
            Sign In
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 'bold' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}