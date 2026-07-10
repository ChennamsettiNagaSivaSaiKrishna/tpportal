import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const StudentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    roll_number: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Prepare metadata for tracing
    const debugData = {
      timestamp: new Date().toISOString(),
      submittedData: {
        full_name: formData.full_name,
        email: formData.email,
        roll_number: formData.roll_number
      },
      errorDetails: {}
    };

    try {
      const response = await API.post('/auth/register/student', {
        full_name: formData.full_name,
        email: formData.email,
        roll_number: formData.roll_number,
        password: formData.password,
        role: 'student'
      });

      if (response.data.success) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/student/login'), 2500);
      }
    } catch (err) {
      // Package the exact failure conditions
      debugData.errorDetails = {
        message: err.message,
        code: err.code,
        status: err.response?.status || 'No Response From Server',
        serverErrorBody: err.response?.data || null,
        apiUrlTarget: err.config?.url || null,
      };

      setError(`Network error caught. Writing log file...`);
      
      // Trigger local browser file download automatically
      try {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(debugData, null, 2)
        )}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `registration_debug_${formData.roll_number || 'log'}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      } catch (fileWriteError) {
        console.error("Local file system writing link failed", fileWriteError);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      
      {/* Left Design Split Frame (Matching the login screen visual balance) */}
      <div style={{ flex: 1, backgroundColor: '#4F46E5', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', padding: '3rem' }}>
        <div style={{ maxWidth: '450px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '800' }}>Join TP Portal</h1>
          <p style={{ fontSize: '1.1rem', color: '#E0E7FF', lineHeight: '1.6' }}>
            Create your account to track training program schedules, manage certifications, build your professional skills matrix, and apply directly to incoming corporate campus drives.
          </p>
        </div>
      </div>

      {/* Right Interactive Form Box Frame */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 3rem', overflowY: 'auto' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ color: '#1E293B', margin: '0 0 0.5rem 0', fontSize: '1.6rem', fontWeight: '700' }}>Student Register</h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>Create your profile account to get started with placements.</p>
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', borderRadius: '8px', backgroundColor: '#FEE2E2', color: '#EF4444', fontSize: '0.875rem', fontWeight: '500' }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', borderRadius: '8px', backgroundColor: '#D1FAE5', color: '#10B981', fontSize: '0.875rem', fontWeight: '500' }}>
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            <div>
              <label style={labelStyle}>Full Name</label>
              <input 
                type="text" 
                name="full_name"
                value={formData.full_name} 
                onChange={handleChange}
                style={inputStyle}
                placeholder="Enter your full name"
                required 
              />
            </div>

            <div>
              <label style={labelStyle}>Institutional Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange}
                style={inputStyle}
                placeholder="yourname@college.edu"
                required 
              />
            </div>

            <div>
              <label style={labelStyle}>Roll Number / Registration Code</label>
              <input 
                type="text" 
                name="roll_number"
                value={formData.roll_number} 
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g., 22XX1A05XX"
                required 
              />
            </div>

            <div>
              <label style={labelStyle}>Choose Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password} 
                onChange={handleChange}
                style={inputStyle}
                placeholder="••••••••"
                required 
              />
            </div>

            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword} 
                onChange={handleChange}
                style={inputStyle}
                placeholder="••••••••"
                required 
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input 
                type="checkbox" 
                name="termsAccepted"
                id="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                style={{ accentColor: '#4F46E5', marginTop: '0.15rem' }} 
              />
              <label htmlFor="termsAccepted" style={{ fontSize: '0.825rem', color: '#64748B', cursor: 'pointer', lineHeight: '1.4' }}>
                I agree to the <span style={{ color: '#4F46E5', fontWeight: '600' }}>Terms & Conditions</span> and verify that all my academic credentials are accurate.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                backgroundColor: '#4F46E5',
                color: 'white',
                padding: '0.75rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4338CA')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4F46E5')}
            >
              {loading ? 'Creating Portal Profile...' : 'Register'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748B' }}>
              Already have an account?{' '}
              <span onClick={() => navigate('/student/login')} style={{ color: '#4F46E5', fontWeight: '600', cursor: 'pointer' }}>
                Sign In
              </span>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.4rem',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#334155'
};

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.9rem',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  outline: 'none',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

export default StudentRegister;