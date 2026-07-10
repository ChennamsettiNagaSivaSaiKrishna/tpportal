import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar Layout panel */}
      <aside style={{ width: '260px', background: 'white', borderRight: '1px solid var(--border-color)', padding: '1.5rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-purple)', marginBottom: '2rem' }}>
          🌐 TP PORTAL
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => navigate('/student/dashboard')} style={sidebarBtnStyle}>📊 Dashboard</button>
          <button onClick={() => navigate('/student/profile')} style={sidebarBtnStyle}>👤 My Profile</button>
          <button onClick={() => navigate('/student/skills')} style={sidebarBtnStyle}>⚙️ Professional Skills</button>
          <button onClick={() => navigate('/student/drives')} style={sidebarBtnStyle}>💼 Campus Drives</button>
        </nav>
      </aside>

      {/* Main Panel Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: '70px', background: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: '500' }}>Welcome, Student</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0' }}></div>
          </div>
        </header>
        <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

const sidebarBtnStyle = {
  width: '100%',
  textAlign: 'left',
  padding: '0.75rem 1rem',
  background: 'none',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  color: 'var(--text-main)',
  fontWeight: '500',
  transition: 'all 0.2s'
};

export default DashboardLayout;