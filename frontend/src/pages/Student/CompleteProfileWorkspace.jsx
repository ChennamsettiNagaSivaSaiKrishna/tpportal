import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';
import '../../App.css';

const CompleteProfileWorkspace = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [branch, setBranch] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/student/complete-profile', {
        branch,
        cgpa: parseFloat(cgpa),
        phone_number: phoneNumber.trim()
      });
      if (res.data.success) {
        // Force reload page to re-trigger the ProfileGuard verification state check
        window.location.href = '/student/dashboard';
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing transaction payload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container">
      <header className="nav-container">
        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-title)' }}>
          TP PORTAL • ONBOARDING
        </div>
        <div className="nav-right-group">
          <span className="static-nav-item" onClick={logout}>Abort Session</span>
        </div>
      </header>

      <div className="auth-wrapper">
        <div className="glass-auth-card" style={{ maxWidth: '460px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', backgroundColor: 'rgba(16,185,129,0.08)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
              Action Required
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-title)', margin: '0.5rem 0 0.25rem 0', letterSpacing: '-0.03em' }}>
              Create Placement Profile
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)', margin: 0, lineHeight: '1.4' }}>
              You do not have permission to access the workspace metrics panel until your academic background parameters are verified.
            </p>
          </div>

          <form onSubmit={handleSetup}>
            <div className="form-group">
              <label className="form-label">Academic Branch / Stream</label>
              <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} className="form-input" placeholder="Computer Science Engineering" required />
            </div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">Current CGPA Score</label>
                <input type="number" step="0.01" min="0" max="10" value={cgpa} onChange={(e) => setCgpa(e.target.value)} className="form-input" placeholder="8.75" required />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone Number</label>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="form-input" placeholder="9876543210" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop: '1.5rem' }}>
              {loading ? 'Configuring System Profile...' : 'Save & Initialize Access'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfileWorkspace;