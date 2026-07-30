import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useRights } from '../../context/RightsContext';

const StudentVerification = () => {
  const { hasRight, loadingRights } = useRights();

  // 1. Dynamic RBAC Permission Evaluation from DB Rights
  const hasModuleAccess = hasRight('NAV_STUDENT_VERIFY');
  const canVerifyStudent = hasRight('BTN_VERIFY_STUDENT');

  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Compiles pending queue arrays directly from server endpoints
  const fetchPendingPool = async (showSilently = false) => {
    if (!showSilently) setLoading(true);
    try {
      const res = await API.get('/placement/students-pending-verification');
      if (res.data && res.data.success) {
        setPendingList(res.data.data || res.data.students || []);
      }
    } catch (err) {
      console.error("Failed to load verification queue arrays:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasModuleAccess) {
      fetchPendingPool(false);

      // Auto-refresh interval sync routine loops every 30 seconds to catch active signups
      const backgroundSyncEngine = setInterval(() => {
        fetchPendingPool(true);
      }, 30000);

      return () => clearInterval(backgroundSyncEngine);
    }
  }, [hasModuleAccess]);

  const handleProcessClearance = async (rollNumber, finalDecision) => {
    if (!canVerifyStudent) {
      setMessage({ text: 'Operation blocked: Your profile lacks BTN_VERIFY_STUDENT rights.', type: 'error' });
      return;
    }

    try {
      const res = await API.post('/placement/update-verification-status', {
        target_roll: rollNumber,
        target_status: finalDecision,
        notes: notes
      });

      if (res.data && res.data.success) {
        setMessage({ text: `Profile roll node ${rollNumber} marked successfully as ${finalDecision}!`, type: 'success' });
        setSelectedStudent(null);
        setNotes('');
        fetchPendingPool(false);
      }
    } catch (err) {
      setMessage({ text: 'Failed to complete transaction audit changes.', type: 'error' });
    }
  };

  if (loadingRights) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
        Resolving verification desk access rights...
      </div>
    );
  }

  if (!hasModuleAccess) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        🛑 Access Denied: Your assigned database rights do not grant access to the Student Verification module.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '0.5rem', color: '#fff' }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--accent-color, #a855f7)' }}>Placement Team Operations</span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0.2rem 0 0 0' }}>Student Profile Verification Desk</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Review and audit student registration data parameters before drive alignment clearance activation.</p>
      </div>

      {message.text && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#10b981' : '#ef4444', border: '1px solid rgba(255,255,255,0.05)' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '2fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: PENDING AUDIT RECORDS QUEUE TABLE */}
        <div className="skill-management-card" style={{ padding: '1.5rem', background: '#121620', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '700' }}>Pending Verification Queue ({pendingList.length})</h4>
          
          <div className="catalog-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="catalog-data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '0.75rem 1.25rem', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase' }}>Roll Number</th>
                  <th style={{ padding: '0.75rem 1.25rem', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase' }}>Full Name</th>
                  <th style={{ padding: '0.75rem 1.25rem', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase' }}>Branch Stream</th>
                  <th style={{ padding: '0.75rem 1.25rem', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase' }}>Section</th>
                  <th style={{ padding: '0.75rem 1.25rem', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Action Hub</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="catalog-empty-notice" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Querying structural database maps...</td></tr>
                ) : pendingList.length === 0 ? (
                  <tr><td colSpan="5" className="catalog-empty-notice" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>All active student profiles are currently verified completely!</td></tr>
                ) : (
                  pendingList.map((student) => (
                    <tr key={student.roll_number} className="catalog-data-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td className="catalog-cell-bold" style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#fff' }}>{student.roll_number}</td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#ccc' }}>{student.full_name}</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}><span className="catalog-tag-pill" style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', fontSize: '0.75rem' }}>{student.dept_name || 'CSE'}</span></td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#94a3b8' }}>Sec {student.section || 'A'}</td>
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => setSelectedStudent(student)} 
                          className="catalog-action-btn"
                          style={{ cursor: 'pointer' }}
                        >
                          {canVerifyStudent ? "Inspect Audit →" : "View Dossier →"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION INSPECTOR INTERFACE */}
        {selectedStudent && (
          <div className="glass-auth-card" style={{ background: '#11141d', padding: '1.75rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1.1rem' }}>Profile Dossier Audit</h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-color, #10b981)', fontWeight: '700' }}>Evaluating: {selectedStudent.roll_number}</span>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div><strong>Name:</strong> <span style={{ color: '#ccc' }}>{selectedStudent.full_name}</span></div>
              <div><strong>Email:</strong> <span style={{ color: '#ccc', wordBreak: 'break-all' }}>{selectedStudent.email}</span></div>
              <div><strong>Target Dept:</strong> <span style={{ color: '#ccc' }}>{selectedStudent.dept_name}</span></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Audit Verification Notes</label>
              <textarea 
                className="form-input" 
                rows="3" 
                disabled={!canVerifyStudent}
                placeholder={canVerifyStudent ? "Log grounds for approval or missing updates corrections here..." : "Audit Mode: Notes input disabled"}
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', background: '#121620', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.5rem', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {canVerifyStudent ? (
                <>
                  <button 
                    onClick={() => handleProcessClearance(selectedStudent.roll_number, 'Approved')}
                    className="submit-btn" 
                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
                  >
                    ✔ Clear Profile (Approve)
                  </button>
                  <button 
                    onClick={() => handleProcessClearance(selectedStudent.roll_number, 'Rejected')}
                    className="submit-btn" 
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
                  >
                    ✖ Flag Infraction (Reject)
                  </button>
                </>
              ) : (
                <div style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', textAlign: 'center', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  👁️ AUDIT MODE: Read-Only Privilege (BTN_VERIFY_STUDENT Missing)
                </div>
              )}
              
              <button 
                onClick={() => setSelectedStudent(null)}
                style={{ background: 'transparent', color: '#6b7280', border: 'none', padding: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Cancel Review
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentVerification;