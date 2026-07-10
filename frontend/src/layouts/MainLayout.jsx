import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'sans-serif' }}>
      {/* Universal Top Navigation Bar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 4rem', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#4F46E5', cursor: 'pointer' }} onClick={() => navigate('/')}>
          🌐 TP PORTAL
        </div>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <span style={navLinkStyle} onClick={() => navigate('/')}>Home</span>
          <span style={navLinkStyle} onClick={() => navigate('/about')}>About</span>
          <span style={navLinkStyle} onClick={() => navigate('/contact')}>Contact</span>
          <span style={{ ...navLinkStyle, color: '#4F46E5', fontWeight: '600' }} onClick={() => navigate('/login-selection')}>Portal Login</span>
        </nav>
      </header>
      
      {/* Page Content Container */}
      <main style={{ padding: '3rem 4rem' }}>
        {children}
      </main>
    </div>
  );
};

const navLinkStyle = {
  cursor: 'pointer',
  color: '#4F46E5',
  fontSize: '0.95rem',
  fontWeight: '500'
};

export default MainLayout;