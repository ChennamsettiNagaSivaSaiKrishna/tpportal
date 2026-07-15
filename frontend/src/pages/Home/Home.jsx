import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Home = () => {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  
  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const getIcon = (type, targetColor) => {
    const rawIcons = {
      key: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={targetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
        </svg>
      ),
      trend: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={targetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>
        </svg>
      ),
      officer: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={targetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      coordinator: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={targetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      chart: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={targetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>
        </svg>
      ),
      shield: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={targetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7s0 6 8 10z"></path>
        </svg>
      )
    };

    const target = targetColor || '#10b981';
    const hex = target.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) || 16;
    const g = parseInt(hex.slice(2, 4), 16) || 185;
    const b = parseInt(hex.slice(4, 6), 16) || 129;

    return (
      <div 
        className="dynamic-v0-icon-wrapper"
        style={{
          '--local-rgb-glow': `${r}, ${g}, ${b}`,
          color: target
        }}
      >
        {rawIcons[type] || rawIcons.key}
      </div>
    );
  };

  const rolesData = {
    student: [
      { id: 'login', title: 'Student Workspace Login', targetRole:'student',icon: getIcon('key', accentColor), desc: 'Access your performance metric dashboard and apply to incoming recruitment tracks.', path: '/login' },
      { id: 'register', title: 'Create Student Profile', targetRole:'student',icon: getIcon('trend', accentColor), desc: 'Instantiate a brand new institutional tracking profile in the placement pipeline.', path: '/register' }
    ],
     placement: [
       { id: 'head',targetRole:'p_head', title: 'Placement Head login', icon: getIcon('chart', accentColor), desc: 'Oversee corporate outreach streams and consolidated batch placement matrices.', path: '/login' },
      { id: 'hod',targetRole:'hod', title: 'Head Of The Department Login', icon: getIcon('officer', accentColor), desc: 'Access departmental clearance states and branch grade matrices.', path: '/login' },
       { id: 'Training',targetRole:'t_head', title: 'Placement Training Head Login', icon: getIcon('officer', accentColor), desc: 'Access departmental clearance states and branch grade matrices.', path: '/login' },
      { id: 'officer',targetRole:'officer',title: 'Placement Officer login', icon: getIcon('officer', accentColor), desc: 'Review, audit, and verify corporate candidate log clearances.', path: '/login' },
      { id: 'coordinator',targetRole:'coordinator', title: 'Coordinator login', icon: getIcon('coordinator', accentColor), desc: 'Log live drive tracking logs and modify daily branch milestones.', path: '/login' },
    
    ],
    management: [
      { id: 'principal',targetRole:'principal', title: 'Principal Login', icon: getIcon('chart', accentColor), desc: 'Review high-level campus success indices and analytical overviews.', path: '/login' },
      { id: 'director', targetRole:'director',title: 'Director Login', icon: getIcon('trend', accentColor), desc: 'Audit industrial partnerships and long-term placement roadmaps.', path: '/login' },
      { id: 'secretary',targetRole:'secretary', title: 'Secretary login', icon: getIcon('officer', accentColor), desc: 'Approve centralized audit logs and compliance reporting records.', path: 'login' }
    ],
    admin: [
      { id: 'admin-login', targetRole:'admin',title: 'Administrator Login', icon: getIcon('shield', accentColor), desc: 'Configure environment parameters, manage database caches, and execute system role audits.', path: '/login' }
    ]
  };

  const placementMetrics = [
    { value: "94.2%", label: "Placement Rate", sub: "Batch of 2025" },
    { value: "44 LPA", label: "Highest Package", sub: "Product Core Sector" },
    { value: "6.8 LPA", label: "Average Package", sub: "Across All Streams" },
    { value: "180+", label: "Hiring Partners", sub: "Global Tech Partners" },
  ];

  const corporatePartners = [
    "Amazon", "Microsoft", "TCS Digital", "Infosys Power Programmer", 
    "Cognizant Next", "Accenture Advanced", "Capgemini", "Wipro Turbo"
  ];



  const handleTargetRole=(role)=>{console.log(role);
      navigate('/login',{
        state:{
        targetRole:role.targetRole
  }})
  }


  return (
    <div className="landing-layout-wrapper">
      <header className="landing-navigation-bar">
        <div className="nav-brand-container" onClick={() => handleTabChange('home')}>
          <div className="nav-logo-marker"></div>
          <span className="nav-brand-title">TP PORTAL</span>
        </div>

        <nav className="nav-matrix-links">
          <div className="nav-public-group">
            <button 
              onClick={() => handleTabChange('home')} 
              className={`nav-link-btn ${activeTab === 'home' ? 'active-tab-link' : ''}`}
            >
              Home
            </button>
          </div>

          <div className="nav-divider-line"></div>

          <div className="nav-roles-group">
            {['student', 'placement', 'management', 'admin'].map((role) => (
              <button 
                key={role}
                onClick={() => handleTabChange(role)} 
                className={`nav-role-btn ${activeTab === role ? 'active-role-highlight' : ''}`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {activeTab === 'home' ? (
        <>
          <section className="landing-hero-viewport">
            <div className="hero-content-workspace">
              <span className="hero-tag-badge">Accredited With National Excellence</span>
              <h1 className="hero-main-title">
                Engineering the Future.<br />
                <span className="highlight-text-stream">Securing Elite Global Careers.</span>
              </h1>
              <p className="hero-description-paragraph">
                Welcome to the centralized Training & Placement ecosystem. Select your structural role entry key 
                in the navigation utility panel above to instantly configure your gateway matrix tracking view.
              </p>
              <button onClick={() => handleTabChange('student')} className="hero-primary-action-btn">
                Get Started &rarr;
              </button>
            </div>
            <div></div>
          </section>

          <section className="landing-metrics-container">
            <div className="metrics-section-heading">
              <span className="metrics-pre-title">Assistance Indices</span>
              <h2 className="metrics-main-title">Corporate Recruitment Track Records</h2>
            </div>
            
            <div className="landing-metrics-grid">
              {placementMetrics.map((metric, index) => (
                <div key={index} className="metric-analytics-card">
                  <div className="metric-counter-value">{metric.value}</div>
                  <div className="metric-counter-label">{metric.label}</div>
                  <div className="metric-counter-sub">{metric.sub}</div>
                </div>
              ))}
            </div>
          </section>

          {/* FIXED MARQUEE CONTAINER STRIP */}
          <section className="corporate-ticker-strip">
            <div className="ticker-wrapper-content">
              <div className="ticker-title-container">
                <span className="ticker-intro-title">OUR PRIME RECRUITERS:</span>
              </div>
              <div className="marquee-track-window">
                <div className="ticker-brands-marquee">
                  {corporatePartners.concat(corporatePartners).map((brand, index) => (
                    <span key={index} className="marquee-brand-item">{brand}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <main className="context-main-panel">
          <div className="context-header-block">
            <span className="context-matrix-badge">System Gateway Matrix</span>
            <h1 className="context-panel-title">Select Control Panel Context</h1>
            <p className="context-panel-desc">
              Choose your assigned institutional operating cluster node below to log cleanly into your dashboard parameters.
            </p>
          </div>

          <div className="cards-grid">
            {rolesData[activeTab].map((role) => (
              <div key={role.id} onClick={() =>handleTargetRole(role)} className="v0-selection-card">
                <div>
                  <div>{role.icon}</div>
                  <h3 className="v0-card-title">{role.title}</h3>
                  <p className="v0-card-desc">{role.desc}</p>
                </div>
                
                <div className="card-action-footer">
                  Open workspace context <span>➔</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      <footer className="landing-global-footer">
        <p>&copy; 2026 Institute Campus Board | Centralized Training & Placement cell.</p>
      </footer>
    </div>
  );
};

export default Home;