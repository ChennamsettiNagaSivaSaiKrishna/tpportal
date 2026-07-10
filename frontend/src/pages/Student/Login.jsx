import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api'; // Re-introduced your working API service instance
import '../../App.css';

const UnifiedStudentAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Keeps login hook track functional
  const { accentColor } = useTheme();
  
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Field States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '', width: '0%' });

  const handleTabSwitch = (targetMode) => {
    setActiveTab(targetMode);
    setError('');
    setValidationErrors({});
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordStrength({ score: 0, text: '', color: '', width: '0%' });
  };

  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, text: '', color: '', width: '0%' });
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (password.length < 6 || score <= 2) {
      setPasswordStrength({ score: 1, text: 'Weak Password', color: '#ef4444', width: '33%' });
    } else if (password.length >= 8 && score === 5) {
      setPasswordStrength({ score: 3, text: 'Strong Password', color: '#10b981', width: '100%' });
    } else {
      setPasswordStrength({ score: 2, text: 'Moderate Password', color: '#f59e0b', width: '66%' });
    }
  }, [password]);

  const validateFields = () => {
    const errors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email.trim())) {
      errors.email = 'Enter a valid institutional email address.';
    }

    if (activeTab === 'register') {
      if (fullName.trim().length < 2) {
        errors.fullName = 'Identity string requires at least 2 characters.';
      }

      const rollRegex = /^[a-zA-Z0-9-]{4,15}$/;
      if (!rollRegex.test(rollNumber.trim())) {
        errors.rollNumber = 'Provide a valid institutional roll number parameter.';
      }

      if (passwordStrength.score < 2) {
        errors.password = 'Credentials do not meet complexity filters.';
      }

      if (password !== confirmPassword) {
        errors.confirmPassword = 'Confirmation verify code target does not match.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateFields()) return;
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const data = await login({ email: email.trim(), password }, 'student');
        if (data.success) {
          navigate('/student/dashboard'); 
        }
      } else {
        // FIXED: Using direct API service route. Verified fields map straight to your register controller destructuring structure.
        const res = await API.post('/auth/register/student', {
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          roll_number: rollNumber.trim(),
          role: 'student' 
        });
        
        if (res.data.success) {
          handleTabSwitch('login');
          setError('Registration successful! Authenticate below to initialize session.');
        }
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message 
                          || err.response?.data?.error 
                          || err.message 
                          || 'Transaction error encountered.';
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container">
      <header className="nav-container">
        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--accent-color)' }}></div>
          TP PORTAL
        </div>
        <div className="nav-right-group">
          <span className="static-nav-item" onClick={() => navigate('/')}>Back to Gateway</span>
        </div>
      </header>

      <div className="auth-wrapper">
        <div className="glass-auth-card" style={{ maxWidth: activeTab === 'register' ? '540px' : '420px', transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease, border-color 0.2s ease' }}>
          
          <div className="auth-nav-tabs">
            <button type="button" className={`auth-tab-btn ${activeTab === 'login' ? 'active-auth-tab' : ''}`} onClick={() => handleTabSwitch('login')}>Sign In</button>
            <button type="button" className={`auth-tab-btn ${activeTab === 'register' ? 'active-auth-tab' : ''}`} onClick={() => handleTabSwitch('register')}>Register</button>
          </div>

          {error && (
            <div className="error-banner" style={{ backgroundColor: error.includes('successful') ? 'rgba(16,185,129,0.1)' : undefined, borderColor: error.includes('successful') ? 'rgba(16,185,129,0.2)' : undefined, color: error.includes('successful') ? '#10b981' : undefined }}>
              {error.includes('successful') ? '✅' : '⚠️'} {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            
            {activeTab === 'register' && (
              <div className="form-row-double">
                <div className="form-group">
                  <label className="form-label">Full Name<span className="mandatory-star">*</span></label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="form-input" placeholder="Nagasiva" required />
                  {validationErrors.fullName && <span className="field-validation-msg">{validationErrors.fullName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number<span className="mandatory-star">*</span></label>
                  <input type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="form-input" placeholder="26POLY01" required />
                  {validationErrors.rollNumber && <span className="field-validation-msg">{validationErrors.rollNumber}</span>}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Academic Email<span className="mandatory-star">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="sai@student.edu" required />
              {validationErrors.email && <span className="field-validation-msg">{validationErrors.email}</span>}
            </div>

            {activeTab === 'register' ? (
              <div className="form-row-double">
                <div className="form-group">
                  <label className="form-label">Password<span className="mandatory-star">*</span></label>
                  <div className="password-input-container">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="••••••••" required />
                    <button type="button" className="password-toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                  {passwordStrength.text && (
                    <div className="strength-meter-wrapper">
                      <div className="strength-meter-bar-track"><div className="strength-meter-bar-fill" style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}></div></div>
                      <span className="strength-text-label" style={{ color: passwordStrength.color }}>{passwordStrength.text}</span>
                    </div>
                  )}
                  {validationErrors.password && <span className="field-validation-msg">{validationErrors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password<span className="mandatory-star">*</span></label>
                  <div className="password-input-container">
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input" placeholder="••••••••" required />
                    <button type="button" className="password-toggle-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && <span className="field-validation-msg">{validationErrors.confirmPassword}</span>}
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Account Password<span className="mandatory-star">*</span></label>
                <div className="password-input-container">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="••••••••" required />
                  <button type="button" className="password-toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
                {validationErrors.password && <span className="field-validation-msg">{validationErrors.password}</span>}
              </div>
            )}

            {activeTab === 'login' && (
              <div className="form-options">
                <label className="checkbox-label"><input type="checkbox" className="checkbox-input" /><span>Keep active</span></label>
                <span className="forgot-link" onClick={() => navigate('/forgot-password')}>Forgot password?</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Processing Workspace Node...' : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default UnifiedStudentAuth;