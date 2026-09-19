import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import '../../App.css';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Wizard Steps: 1 = Email, 2 = OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Strength Monitor
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '', width: '0%' });

  // Resend OTP Countdown Timer
  const [countdown, setCountdown] = useState(60);

  // Auto-redirect countdown on success
  const [redirectCount, setRedirectCount] = useState(5);

  // Track OTP countdown
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Track redirect countdown on success
  useEffect(() => {
    let timer;
    if (step === 4) {
      timer = setInterval(() => {
        setRedirectCount((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, navigate]);

  // Dynamic Password Strength Meter
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({ score: 0, text: '', color: '', width: '0%' });
      return;
    }
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (newPassword.length < 6 || score <= 2) {
      setPasswordStrength({ score: 1, text: 'Weak Password', color: '#ef4444', width: '33%' });
    } else if (newPassword.length >= 8 && score >= 4) {
      setPasswordStrength({ score: 3, text: 'Strong Password', color: '#10b981', width: '100%' });
    } else {
      setPasswordStrength({ score: 2, text: 'Moderate Password', color: '#f59e0b', width: '66%' });
    }
  }, [newPassword]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setInfoMessage('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid institutional email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/auth/forgot-password', { email: email.trim() });
      if (response.data.success) {
        setStep(2);
        setCountdown(60);
        // Pre-populate or show helper message if OTP returned for development testing
        if (response.data.otp) {
          setInfoMessage(`Verification code sent! [DEV CODE: ${response.data.otp}]`);
        } else {
          setInfoMessage('A 6-digit verification code has been dispatched to your email.');
        }
      } else {
        setError(response.data.message || 'Unable to process reset request.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP box input and auto-focus next
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      const lastInput = document.getElementById('otp-input-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/auth/verify-otp', {
        email: email.trim(),
        otp: fullOtp
      });
      if (response.data.success) {
        setStep(3);
        setInfoMessage('Code verified! Create your new secure password below.');
      } else {
        setError(response.data.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password Submission
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (passwordStrength.score < 2) {
      setError('Please choose a stronger password matching security guidelines.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.join(''),
        newPassword
      });

      if (response.data.success) {
        setStep(4);
      } else {
        setError(response.data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container">
      {/* Navigation Header */}
      <header className="nav-container">
        <div
          style={{
            fontWeight: '700',
            fontSize: '0.95rem',
            color: 'var(--text-title)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              backgroundColor: 'var(--accent-color, #10b981)'
            }}
          ></div>
          TP PORTAL
        </div>
        <div className="nav-right-group">
          <span className="static-nav-item" onClick={() => navigate('/login')}>
            Back to Sign In
          </span>
        </div>
      </header>

      {/* Main Password Reset Wizard Card */}
      <div className="auth-wrapper">
        <div className="glass-auth-card" style={{ maxWidth: '440px', width: '100%' }}>
          
          {/* Header & Step Wizard Indicator */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: 'var(--accent-color, #10b981)',
                marginBottom: '0.75rem'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-title)', margin: '0 0 0.25rem 0' }}>
              {step === 4 ? 'Password Reset Complete' : 'Reset Account Password'}
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.4 }}>
              {step === 1 && 'Enter your institutional email to receive a verification OTP code.'}
              {step === 2 && `Enter the 6-digit code sent to ${email}`}
              {step === 3 && 'Choose a strong new password for your account.'}
              {step === 4 && 'Your credentials have been securely updated.'}
            </p>
          </div>

          {/* Stepper Progress Indicator (Steps 1 to 3) */}
          {step < 4 && (
            <div className="reset-step-indicator">
              <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
              <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
              <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
              <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
            </div>
          )}

          {/* Feedback Banners */}
          {error && (
            <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚠️</span> <span>{error}</span>
            </div>
          )}
          {infoMessage && !error && (
            <div
              className="error-banner"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>✅</span> <span>{infoMessage}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} noValidate>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  Institutional Email Address<span className="mandatory-star">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="student@institution.org"
                  required
                  autoFocus
                />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Generating Code...' : 'Send Verification OTP ➔'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <span
                  className="forgot-link"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => navigate('/login')}
                >
                  ← Return to Sign In
                </span>
              </div>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} noValidate>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>
                  Enter 6-Digit OTP Code<span className="mandatory-star">*</span>
                </label>
                <div className="otp-inputs-wrapper" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="otp-digit-input"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="otp-timer-row">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                  {countdown > 0 ? (
                    `Resend code in ${countdown}s`
                  ) : (
                    <button
                      type="button"
                      className="resend-otp-btn"
                      onClick={handleRequestOtp}
                      disabled={loading}
                    >
                      Resend Code Now
                    </button>
                  )}
                </span>
                <span
                  className="forgot-link"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setInfoMessage('');
                  }}
                >
                  Change Email
                </span>
              </div>

              <button type="submit" disabled={loading || otp.join('').length !== 6} className="submit-btn">
                {loading ? 'Validating...' : 'Verify Code & Proceed ➔'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <span
                  className="forgot-link"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => navigate('/login')}
                >
                  ← Return to Sign In
                </span>
              </div>
            </form>
          )}

          {/* STEP 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} noValidate>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  New Account Password<span className="mandatory-star">*</span>
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter at least 8 characters"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="password-toggle-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>

                {passwordStrength.text && (
                  <div className="strength-meter-wrapper" style={{ marginTop: '0.4rem' }}>
                    <div className="strength-meter-bar-track">
                      <div
                        className="strength-meter-bar-fill"
                        style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                      ></div>
                    </div>
                    <span className="strength-text-label" style={{ color: passwordStrength.color }}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  Confirm New Password<span className="mandatory-star">*</span>
                </label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Re-enter your new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-eye"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Securing Account...' : 'Set New Password & Complete ➔'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <span
                  className="forgot-link"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => navigate('/login')}
                >
                  ← Return to Sign In
                </span>
              </div>
            </form>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid #10b981',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-title)', margin: '0 0 0.5rem 0' }}>
                Password Updated!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1.5rem' }}>
                Your password has been reset successfully. You will be redirected to the sign-in portal in {redirectCount}s.
              </p>

              <button
                type="button"
                className="submit-btn"
                onClick={() => navigate('/login')}
              >
                Proceed to Sign In Now ➔
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
