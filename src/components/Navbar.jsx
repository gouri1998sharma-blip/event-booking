import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Active page path check karne ke liye
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  // Active Pill Background Style Generator
  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: '#FFFFFF',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '0.9rem',
      padding: '0.45rem 1rem',
      borderRadius: '20px',
      background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
      transition: 'all 0.2s ease-in-out'
    };
  };

  return (
    <>
      <style>{`
        .desktop-nav {
          display: flex !important;
          align-items: center;
          gap: 0.8rem;
        }
        .mobile-hamburger {
          display: none !important;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-hamburger {
            display: block !important;
          }
        }
      `}</style>

      <nav style={{
        background: 'linear-gradient(135deg, #6D28D9, #4C1D95)',
        color: '#FFFFFF',
        padding: '0.75rem 1.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          
          {/* LOGO */}
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: '#FFFFFF' }}>
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              background: '#FFFFFF',
              color: '#6D28D9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.2rem'
            }}>
              e
            </div>
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', lineHeight: 1, display: 'block' }}>EventPlace</span>
              <small style={{ fontSize: '0.65rem', opacity: 0.8, letterSpacing: '1px', textTransform: 'uppercase' }}>Multivendor Event</small>
            </div>
          </Link>

          {/* 💻 DESKTOP NAVBAR */}
          <div className="desktop-nav">
            <Link to="/" style={getLinkStyle('/')}>
              Events
            </Link>

            {token ? (
              <>
                {/* User / Admin Emoji Pill Button (Image 1 Style) */}
                <Link to="/dashboard" style={getLinkStyle('/dashboard')}>
                  👤 Dashboard ({user.name || 'User'})
                </Link>

                <button 
                  onClick={handleLogout} 
                  style={{ 
                    background: '#EF4444', 
                    color: '#FFF', 
                    border: 'none', 
                    padding: '0.45rem 1.2rem', 
                    borderRadius: '20px', 
                    fontWeight: '700', 
                    cursor: 'pointer', 
                    fontSize: '0.9rem',
                    marginLeft: '0.3rem' 
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={getLinkStyle('/login')}>
                  Login
                </Link>
                <Link to="/register" style={getLinkStyle('/register')}>
                  Register
                </Link>
              </>
            )}
          </div>

          {/* 📱 MOBILE HAMBURGER BUTTON */}
          <button 
            className="mobile-hamburger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '1.6rem',
              cursor: 'pointer',
              padding: '0.2rem'
            }}
          >
            {isMobileMenuOpen ? '✖' : '☰'}
          </button>
        </div>

        {/* 📱 MOBILE MENU DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="mobile-hamburger" style={{
            marginTop: '0.8rem',
            paddingTop: '0.8rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={getLinkStyle('/')}>
              🎪 Events
            </Link>

            {token ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={getLinkStyle('/dashboard')}>
                  👤 Dashboard ({user.name || 'User'})
                </Link>
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    background: '#EF4444', 
                    color: '#FFF', 
                    border: 'none', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '8px', 
                    fontWeight: '700', 
                    cursor: 'pointer', 
                    fontSize: '0.9rem', 
                    width: 'fit-content' 
                  }}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.3rem' }}>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={getLinkStyle('/login')}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} style={getLinkStyle('/register')}>
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}