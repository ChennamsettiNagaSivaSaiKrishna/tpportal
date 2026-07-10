import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';
import '../../App.css';

const StudentDashboard = () => {
  const { logout } = useAuth();
  const resumePrintRef = useRef();
  
  // States
  const [activeTab, setActiveTab] = useState('metrics'); // metrics, placements, skills, info, resume
  const [profileData, setProfileData] = useState({
    fullName: '', rollNumber: '', email: '', branch: '', cgpa: 0, phoneNumber: '', verificationStatus: '', departmentId: ''
  });
  const [dashboardMetrics, setDashboardMetrics] = useState({ applications: 0, verified: false, drives: 0 });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Skills Module States
  const [newSkill, setNewSkill] = useState('');
  const [skillRating, setSkillRating] = useState(80);
  const [skillsList, setSkillsList] = useState([]);
  
  // Profile Form State
  const [formData, setFormData] = useState({
    fullName: '', phoneNumber: '', cgpa: '', rollNumber: '', activeBacklogs: '0', departmentId: ''
  });

  // Ephemeral Resume Generation States
  const [resumeData, setResumeData] = useState({
    summary: '',
    experience: '',
    projects: '',
    hobbies: ''
  });
  const [isResumeConfigured, setIsResumeConfigured] = useState(false);

  const isProfileComplete = profileData.branch && profileData.rollNumber && profileData.phoneNumber;

  // 10-Minute Activity Monitor Loop
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        alert('Session expired due to 10 minutes of inactivity.');
        logout();
      }, 600000);
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [logout]);

  const fetchWorkspaceData = useCallback(async () => {
    try {
      setLoading(true);
      const profileRes = await API.get('/student/profile');
      let currentRollNumber = null;

      if (profileRes.data.success) {
        const p = profileRes.data.profile;
        setProfileData(p);
        currentRollNumber = p.rollNumber;
        setFormData({
          fullName: p.fullName || '',
          phoneNumber: p.phoneNumber || '',
          cgpa: p.cgpa ? p.cgpa.toString() : '',
          rollNumber: p.rollNumber || '',
          activeBacklogs: '0',
          departmentId: p.departmentId || ''
        });
      }

      const deptsRes = await API.get('/student/departments-list');
      if (deptsRes.data.success) setDepartments(deptsRes.data.departments);

      if (currentRollNumber) {
        const metricsRes = await API.get('/student/dashboard-metrics');
        if (metricsRes.data.success) setDashboardMetrics(metricsRes.data.metrics);
        
        const skillsRes = await API.get('/student/skills');
        if (skillsRes.data.success) setSkillsList(skillsRes.data.skills || []);
      }
    } catch (err) {
      console.error('Synchronization fault:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await API.put('/student/profile', {
        full_name: formData.fullName.trim(),
        mobile: formData.phoneNumber.trim(),
        cgpa: parseFloat(formData.cgpa),
        active_backlogs: parseInt(formData.activeBacklogs, 10),
        roll_number: formData.rollNumber.trim(),
        department_id: parseInt(formData.departmentId, 10)
      });
      if (res.data.success) {
        await fetchWorkspaceData();
        setActiveTab('metrics');
      }
    } catch (err) {
      alert('Error updating core profile metrics.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      const res = await API.post('/student/skills', { 
        skill_name: newSkill.trim(),
        rating: parseInt(skillRating, 10)
      });
      if (res.data.success) {
        setNewSkill('');
        const skillsRes = await API.get('/student/skills');
        if (skillsRes.data.success) setSkillsList(skillsRes.data.skills || []);
      }
    } catch (err) {
      alert('Failed to register skill item.');
    }
  };

  const triggerResumePrint = () => {
    window.print();
  };

  if (loading) return <div className="portal-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Syncing Portal Context...</div>;

  return (
    <div className="dashboard-wrapper">
      
      {/* SIDEBAR NAVIGATION BAR CONTROL */}
      <aside className="workspace-sidebar">
        <div className="sidebar-main-nav">
          <div className="sidebar-brand">TP PORTAL</div>
          <div className={`sidebar-link ${activeTab === 'metrics' && isProfileComplete ? 'active-link' : ''}`} style={{ opacity: isProfileComplete ? 1 : 0.5 }} onClick={() => isProfileComplete && setActiveTab('metrics')}>Dashboard Home</div>
          <div className={`sidebar-link ${activeTab === 'placements' && isProfileComplete ? 'active-link' : ''}`} style={{ opacity: isProfileComplete ? 1 : 0.5 }} onClick={() => isProfileComplete && setActiveTab('placements')}>Open Placements</div>
          <div className={`sidebar-link ${activeTab === 'skills' && isProfileComplete ? 'active-link' : ''}`} style={{ opacity: isProfileComplete ? 1 : 0.5 }} onClick={() => isProfileComplete && setActiveTab('skills')}>Technical Skills</div>
          <div className={`sidebar-link ${activeTab === 'resume' && isProfileComplete ? 'active-link' : ''}`} style={{ opacity: isProfileComplete ? 1 : 0.5 }} onClick={() => isProfileComplete && setActiveTab('resume')}>Resume Builder</div>
          <div className={`sidebar-link ${activeTab === 'info' || !isProfileComplete ? 'active-link' : ''}`} onClick={() => { setIsResumeConfigured(false); setActiveTab('info'); }}>Profile Information {!isProfileComplete && '⚠️'}</div>
          <div className="sidebar-link" style={{ marginTop: '2rem', color: '#f87171' }} onClick={logout}>Log Out</div>
        </div>
      </aside>

      {/* DYNAMIC FRAME ROUTER VIEW CONTAINER */}
      <main className="workspace-content-frame" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        {/* REQUIREMENT 2: PROFILE DETAILS UPDATION VIEW POSITIONED EXACTLY IN THE DEAD CENTER */}
        {!isProfileComplete || activeTab === 'info' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', width: '100%' }}>
            <div style={{ width: '100%', maxWidth: '550px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: '800' }}>Update Profile Details</h2>
              <form onSubmit={handleProfileSubmit} className="glass-auth-card" style={{ width: '100%' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department Stream Branch</label>
                  <select value={formData.departmentId} onChange={(e) => setFormData({...formData, departmentId: e.target.value})} className="form-input" required>
                    <option value="">Choose your registered department...</option>
                    {departments.map(d => <option key={d.id} value={d.id}>[{d.dept_name}] {d.dept_full_name}</option>)}
                  </select>
                </div>
                <div className="form-row-double">
                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <input type="text" value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} className="form-input" required disabled={isProfileComplete} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Phone</label>
                    <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="form-input" required />
                  </div>
                </div>
                <div className="form-row-double">
                  <div className="form-group">
                    <label className="form-label">Aggregate CGPA</label>
                    <input type="number" step="0.01" min="0" max="10" value={formData.cgpa} onChange={(e) => setFormData({...formData, cgpa: e.target.value})} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Active Backlogs</label>
                    <input type="number" min="0" value={formData.activeBacklogs} onChange={(e) => setFormData({...formData, activeBacklogs: e.target.value})} className="form-input" required />
                  </div>
                </div>
                <button type="submit" disabled={submitLoading} className="submit-btn">{submitLoading ? 'Saving...' : 'Sync Workspace Account'}</button>
              </form>
            </div>
          </div>
        ) : activeTab === 'metrics' ? (
          
          /* VIEW PANEL A: ANALYTICS HOME VIEW WITH RATING PROGRESS BARS */
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>Student Dashboard Workspace</h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>Stream Branch: {profileData.branch}</p>

            <div className="metric-cards-row" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <div className="metric-panel-card">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>VERIFICATION AUDIT</span>
                <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem', color: profileData.verificationStatus === 'Clearance Verified' ? '#10b981' : '#f59e0b' }}>{profileData.verificationStatus}</h3>
              </div>
              <div className="metric-panel-card">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>VERIFIED CGPA</span>
                <h3 style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>{Number(profileData.cgpa).toFixed(2)}</h3>
              </div>
              <div className="metric-panel-card">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>JOB APPLICATIONS</span>
                <h3 style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>{dashboardMetrics.applications}</h3>
              </div>
            </div>

            {/* REQUIREMENT 1: RENDER TECHNICAL SKILLS RATINGS WITH CORE THEME PROGRESS BARS */}
            <div className="metric-panel-card" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '700' }}>Configured Technical Skill Matrices</h3>
              {skillsList.length === 0 ? <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>No dynamic skills registered yet. Go to the skills tab to configure.</p> : (
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  {skillsList.map(s => (
                    <div key={s.id} style={{ fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '600' }}>{s.skill_name}</span>
                        <span style={{ color: 'var(--accent-color)', fontWeight: '700' }}>{s.rating || 70}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${s.rating || 70}%`, height: '100%', backgroundColor: 'var(--accent-color)', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'skills' ? (
          
          /* VIEW PANEL B: ADD SKILLS WITH RATINGS INPUT FIELD */
          <div style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Configure Professional Competencies</h1>
            <form onSubmit={handleAddSkillSubmit} className="glass-auth-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Dynamic Skill Name</label>
                <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className="form-input" placeholder="e.g. React Native, Docker, Java" required />
              </div>
              <div className="form-group">
                <label className="form-label">Self Assessed Rating Percentage ({skillRating}%)</label>
                <input type="range" min="10" max="100" step="5" value={skillRating} onChange={(e) => setSkillRating(e.target.value)} style={{ width: '100%', accentColor: 'var(--accent-color)' }} />
              </div>
              <button type="submit" className="submit-btn" style={{ marginTop: '0.5rem' }}>Register Skill Component</button>
            </form>
          </div>
        ) : activeTab === 'resume' ? (
          
          /* REQUIREMENT 3: EPHEMERAL INTERACTIVE RESUME BUILDER WORKSPACE Engine */
          <div>
            {!isResumeConfigured ? (
              <div style={{ maxWidth: '600px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Compile Dynamic Resume Payload</h1>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Provide contextual parameters to map your custom components onto the CV workspace layout framework.</p>
                <div className="glass-auth-card">
                  <div className="form-group">
                    <label className="form-label">Professional Summary Statement</label>
                    <textarea value={resumeData.summary} onChange={(e) => setResumeData({...resumeData, summary: e.target.value})} className="form-input" rows="3" placeholder="Ambitious Engineering student skilled in modern fullstack patterns..."></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Academic Projects Details</label>
                    <textarea value={resumeData.projects} onChange={(e) => setResumeData({...resumeData, projects: e.target.value})} className="form-input" rows="3" placeholder="Campus Drive Tracker Web App: Node, Express, MySQL backend..."></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Extracurricular Activities & Personal Hobbies</label>
                    <textarea value={resumeData.hobbies} onChange={(e) => setResumeData({...resumeData, hobbies: e.target.value})} className="form-input" rows="2" placeholder="Open source contributor, competitive programming competitor..."></textarea>
                  </div>
                  <button onClick={() => { if(resumeData.summary && resumeData.projects) { setIsResumeConfigured(true) } else { alert('Please supply baseline fields first.') } }} className="submit-btn">Compile Preview Canvas</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <button onClick={triggerResumePrint} className="submit-btn" style={{ width: '200px', margin: 0 }}>Download / Print CV</button>
                  <button onClick={() => setIsResumeConfigured(false)} className="submit-btn" style={{ width: '200px', margin: 0, backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>Edit Details</button>
                </div>

                {/* VISUAL LAYOUT SHEET: INJECTS AN ALL-WHITE PRINT FORMAT OVERRIDING PORTAL GLASSMORPHISM */}
                <div id="printable-cv-frame" ref={resumePrintRef} style={{ background: '#fff', color: '#000', padding: '2.5rem', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'serif', lineHeight: '1.5' }}>
                  <div style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', textTransform: 'uppercase' }}>{profileData.fullName}</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', marginTop: '0.25rem', fontFamily: 'sans-serif' }}>
                      <span>Email: {profileData.email}</span>
                      <span>Phone: {profileData.phoneNumber}</span>
                      <span>Roll No: {profileData.rollNumber}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>Academic Timeline</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Branch Stream:</strong> {profileData.branch} Engineering Branch</p>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Cumulative Metrics:</strong> {Number(profileData.cgpa).toFixed(2)} CGPA Score Matrix</p>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>Professional Summary</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', textAlign: 'justify' }}>{resumeData.summary}</p>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>Core Skillsets Stack</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>
                      {skillsList.map(s => `${s.skill_name} (${s.rating}%)`).join(', ')}
                    </p>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>Projects Undertaken</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{resumeData.projects}</p>
                  </div>

                  {resumeData.hobbies && (
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>Extracurricular Coordinates</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>{resumeData.hobbies}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Hiring Drive Records</h1>
            <p style={{ color: 'var(--text-sub)' }}>Synchronizing available recruitment drives table parameters...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;