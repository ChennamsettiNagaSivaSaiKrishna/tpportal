import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ text: '', type: '' });

  // 1. Fetch skills on mount (calls exports.getSkills)
  const fetchSkills = async () => {
    try {
      const response = await API.get('/student/skills');
      if (response.data.success) {
        setSkills(response.data.skills || []);
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // 2. Add a new skill (calls exports.addSkill)
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    setStatus({ text: '', type: '' });

    try {
      const response = await API.post('/student/skills', { skill_name: newSkill.trim() });
      if (response.data.success) {
        setStatus({ text: response.data.message, type: 'success' });
        setNewSkill('');
        fetchSkills(); // Refresh the list
      }
    } catch (err) {
      setStatus({ text: err.response?.data?.message || 'Failed to add skill.', type: 'error' });
    }
  };

  // 3. Remove a skill (calls exports.deleteSkill using URL params)
  const handleDeleteSkill = async (skillId) => {
    setStatus({ text: '', type: '' });
    try {
      const response = await API.delete(`/student/skills/${skillId}`);
      if (response.data.success) {
        setStatus({ text: response.data.message, type: 'success' });
        fetchSkills(); // Refresh the list
      }
    } catch (err) {
      setStatus({ text: 'Failed to delete skill.', type: 'error' });
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Professional Core Skills</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Add technical competencies or programming frameworks to display on your placement matrix.
        </p>

        {status.text && (
          <div style={{ padding: '1rem', marginBottom: '1.25rem', borderRadius: '8px', color: 'white', backgroundColor: status.type === 'success' ? '#10B981' : '#EF4444' }}>
            {status.text}
          </div>
        )}

        {/* Form Input Section */}
        <form onSubmit={handleAddSkill} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="e.g., Python, React, Django, SQL" 
            className="form-input"
            required 
          />
          <button type="submit" className="btn-purple" style={{ whiteSpace: 'nowrap' }}>
            ＋ Add Skill
          </button>
        </form>

        {/* Display Skills Grid List */}
        {loading ? (
          <p>Loading skills database...</p>
        ) : skills.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No core skills added yet. Use the input field above to map your strengths.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {skills.map((skill) => (
              <div 
                key={skill.id} 
                className="glass-card"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '0.75rem 1rem', background: 'white' }}
              >
                <span style={{ fontWeight: '500', flex: 1, marginRight: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {skill.skill_name}
                </span>
                <button 
                  onClick={() => handleDeleteSkill(skill.id)}
                  style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '1.2rem', cursor: 'pointer', padding: 0 }}
                  title="Remove Skill"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Skills;