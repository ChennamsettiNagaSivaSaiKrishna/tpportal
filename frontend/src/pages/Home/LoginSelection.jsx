import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import '../../App.css'; 

const IndustryLoginSelection = () => {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [activeTab, setActiveTab] = useState('student');

  // Unified dynamic vector asset manager with localized color bounds
  const getIcon = (type, targetColor) => {
    const rawIcons = {
      key: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={targetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
        </svg>
      ),
      trend: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={targetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>
        </svg>
      ),
      officer: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={targetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      coordinator: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={targetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      chart: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={targetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>
        </svg>
      ),
      shield: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={targetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7s0 6 8 10z"></path>
        </svg>
      )
    };

    // Parse color string parameters to create standard glowing alpha channels
    const hex = targetColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) || 16;
    const g = parseInt(hex.slice(2, 4), 16) || 185;
    const b = parseInt(hex.slice(4, 6), 16) || 129;

    return (
      <div 
        className="v0-icon-container"
        style={{
          border: `1px solid ${targetColor}33`,
          backgroundColor: `${targetColor}08`,
          '--accent-glow-local': `rgba(${r}, ${g}, ${b}, 0.5)`
        }}
      >
        {rawIcons[type] || rawIcons.key}
      </div>
    );
  };

  // Configuration matrix routing data roles
  const rolesData = {
    student: [
      { id: 'login', title: 'Student Workspace Login', icon: getIcon('key', accentColor), desc: 'Access your performance metric dashboard and apply to incoming recruitment tracks.', path: '/student/login' },
      { id: 'register', title: 'Create Student Profile', icon: getIcon('trend', accentColor), desc: 'Instantiate a brand new institutional tracking profile in the placement pipeline.', path: '/student/register' }
    ],
    placement: [
      { id: 'officer', title: 'Placement Officer Console', icon: getIcon('officer', accentColor), desc: 'Review, audit, and verify corporate candidate log clearances.', path: '/placement/officer/login' },
      { id: 'coordinator', title: 'Coordinator Workspace', icon: getIcon('coordinator', accentColor), desc: 'Log live drive tracking logs and modify daily branch milestones.', path: '/placement/coordinator/login' },
      { id: 'head', title: 'T&P Head Operations', icon: getIcon('chart', accentColor), desc: 'Oversee corporate outreach streams and consolidated batch placement matrices.', path: '/placement/head/login' },
      { id: 'hod', title: 'Department Faculty View', icon: getIcon('officer', accentColor), desc: 'Access departmental clearance states and branch grade matrices.', path: '/hod/login' }
    ],
    management: [
      { id: 'principal', title: 'Principal Panel', icon: getIcon('chart', accentColor), desc: 'Review high-level campus success indices and analytical overviews.', path: '/management/principal/login' },
      { id: 'director', title: 'Director Metrics', icon: getIcon('trend', accentColor), desc: 'Audit industrial partnerships and long-term placement roadmaps.', path: '/management/director/login' },
      { id: 'secretary', title: 'Executive Clearance', icon: getIcon('officer', accentColor), desc: 'Approve centralized audit logs and compliance reporting records.', path: '/management/secretary/login' }
    ],
    admin: [
      { id: 'admin-login', title: 'Global System Administrator', icon: getIcon('shield', accentColor), desc: 'Configure environment parameters, manage database caches, and execute system role audits.', path: '/admin/login' }
    ]
  };

  return (
    <div className="portal-container">
      
      {/* 1. Aligned Navigation Ribbon Dashboard Header Bar */}
      <header className="nav-container">
        <div style={{ fontWeight: '700', fontSize: '0.95rem', letterSpacing: '-0.025em', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--accent-color)', transition: 'background-color 0.2s' }}></div>
          TP PORTAL
        </div>
        
        <div className="nav-right-group">
          <div className="static-links">
            <span className="static-nav-item" onClick={() => navigate('/')}>Home</span>
            <span className="static-nav-item" onClick={() => navigate('/contact')}>Contact</span>
          </div>

          <div className="role-tabs">
            {['student', 'placement', 'management', 'admin'].map((tab) => (
              <span 
                key={tab}
                className={`role-nav-item ${activeTab === tab ? 'active' : ''}`} 
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* 2. Responsive Mobile Breadcrumb Navigation Track Bar */}
      <div className="breadcrumb-mobile-bar">
        <span className="breadcrumb-label">Gateway &gt; </span>
        {['student', 'placement', 'management', 'admin'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`breadcrumb-btn ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Operational Grid Main Container Display Panel */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', boxSizing: 'border-box', padding: '2rem 0' }}>
        <div style={{ textAlign: 'center', padding: '2rem 1.5rem 1rem 1.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', backgroundColor: 'rgba(16,185,129,0.08)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Gateway Matrix
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.04em', margin: '0.75rem 0 0.5rem 0', color: 'var(--text-title)' }}>
            Select Control Panel Context
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
            Choose your assigned institutional operating cluster node below to log cleanly into your dashboard parameters.
          </p>
        </div>

        <div className="cards-grid">
          {rolesData[activeTab].map((role) => (
            <div key={role.id} onClick={() => navigate(role.path)} className="v0-selection-card">
              <div>
                <div style={{ marginBottom: '1.25rem' }}>{role.icon}</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-title)', fontSize: '1rem', fontWeight: '600', letterSpacing: '-0.01em' }}>
                  {role.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-sub)', lineHeight: '1.4' }}>{role.desc}</p>
              </div>
              
              <div className="card-action-footer" style={{ color: 'var(--accent-color)' }}>
                Open workspace context <span>➔</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default IndustryLoginSelection;