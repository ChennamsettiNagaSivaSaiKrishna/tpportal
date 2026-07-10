import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import studentProfileService from '../../services/studentProfileService';
import DashboardLayout from '../../layouts/DashboardLayout';

const Profile = () => {
  const { user } = useAuth(); // Retrieve the authenticated student's details from context
  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    cgpa: '',
    active_backlogs: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch the student profile dynamically using the roll number parameter
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.roll_number) {
        setMessage({ text: 'Roll number missing from session context.', type: 'error' });
        setLoading(false);
        return;
      }

      try {
        const data = await studentProfileService.getProfile(user.roll_number);
        if (data.success && data.student) {
          const { full_name, mobile, cgpa, active_backlogs } = data.student;
          setFormData({
            full_name: full_name || '',
            mobile: mobile || '',
            cgpa: cgpa || '',
            active_backlogs: active_backlogs !== undefined ? active_backlogs : ''
          });
        }
      } catch (err) {
        // If profile doesn't exist yet, we don't crash, we let them create it later
        if (err.response?.status === 404) {
          setMessage({ text: 'No profile found. Please fill in details to create one.', type: 'info' });
        } else {
          setMessage({ text: 'Could not fetch your profile records.', type: 'error' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    try {
      let response;
      // If profile exists we update it, otherwise we can call create profile
      response = await studentProfileService.updateProfile(user.roll_number, formData);
      
      if (response.success) {
        setMessage({ text: response.message || 'Profile saved successfully!', type: 'success' });
      }
    } catch (err) {
      // Fallback fallback: if update fails because it needs to be created first
      try {
        const response = await studentProfileService.createProfile({ ...formData, roll_number: user.roll_number });
        if (response.success) {
          setMessage({ text: 'Profile created successfully!', type: 'success' });
        }
      } catch (createErr) {
        setMessage({ text: createErr.response?.data?.message || 'Failed to save profile.', type: 'error' });
      }
    }
  };

  if (loading) return <DashboardLayout><p style={{ textAlign: 'center' }}>Loading details from portal database...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '0.25rem', color: '#1E293B' }}>Academic Profile Verification</h2>
        <p style={{ color: '#64748B', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Roll Number Account Context: <strong style={{ color: '#4F46E5' }}>{user?.roll_number}</strong>
        </p>
        
        {message.text && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            borderRadius: '8px', 
            color: 'white', 
            backgroundColor: message.type === 'success' ? '#10B981' : message.type === 'info' ? '#3B82F6' : '#EF4444' 
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="form-input" style={inputOverride} required />
          </div>

          <div>
            <label style={labelStyle}>Mobile Number</label>
            <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="form-input" style={inputOverride} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Current CGPA</label>
              <input type="number" name="cgpa" step="0.01" min="0" max="10" value={formData.cgpa} onChange={handleChange} className="form-input" style={inputOverride} required />
            </div>
            <div>
              <label style={labelStyle}>Active Backlogs</label>
              <input type="number" name="active_backlogs" min="0" value={formData.active_backlogs} onChange={handleChange} className="form-input" style={inputOverride} required />
            </div>
          </div>

          <button type="submit" className="btn-purple" style={{ alignSelf: 'flex-start', marginTop: '1rem', backgroundColor: '#4F46E5', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Save Changes
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155', fontSize: '0.9rem' };
const inputOverride = { width: '100%', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '8px', boxSizing: 'border-box' };

export default Profile;