import React, { useState, useEffect } from 'react';

const AttendanceSheetGrid = ({ students, isLocked, onSave, loading }) => {
  const [sheetRecords, setSheetRecords] = useState([]);

  useEffect(() => {
    setSheetRecords(
      students.map(student => ({
        roll_number: student.roll_number,
        full_name: student.full_name,
        branch: student.dept_name || 'General',
        status: student.attendance_status || 'Absent' 
      }))
    );
  }, [students]);

  const handleCheckboxChange = (rollNumber) => {
    if (isLocked) return;
    setSheetRecords(prev => prev.map(record => {
      if (record.roll_number === rollNumber) {
        return { ...record, status: record.status === 'Present' ? 'Absent' : 'Present' };
      }
      return record;
    }));
  };

  const applyBulkMacro = (targetStatus) => {
    if (isLocked) return;
    setSheetRecords(prev => prev.map(record => ({ ...record, status: targetStatus })));
  };

  const handleFormSubmit = () => {
    const optimizedPayload = sheetRecords.map(r => ({
      student_roll: r.roll_number,
      status: r.status
    }));
    onSave(optimizedPayload);
  };

  return (
    <div className="metric-panel-card" style={{ padding: '1.5rem', marginTop: '1.5rem', width: '100%', maxWidth: '100%' }}>
      
      {/* Dynamic Header Tool Row Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            disabled={isLocked || loading}
            onClick={() => applyBulkMacro('Present')}
            className="submit-btn"
            style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          >
            ✓ Mark All Present
          </button>
          <button
            type="button"
            disabled={isLocked || loading}
            onClick={() => applyBulkMacro('Absent')}
            className="submit-btn"
            style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-sub)', border: '1px solid var(--border-color)' }}
          >
            ✕ Clear All Selections
          </button>
        </div>
        
        {isLocked && (
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            🔒 READ-ONLY: Sheet Finalized & Locked
          </span>
        )}
      </div>

      {/* Main Grid Checklist Roster Table Sheet */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-sub)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '1rem 0.75rem', width: '80px', textAlign: 'center' }}>Verify</th>
              <th style={{ padding: '1rem 0.75rem' }}>Roll Number</th>
              <th style={{ padding: '1rem 0.75rem' }}>Full Name</th>
              <th style={{ padding: '1rem 0.75rem' }}>Branch/Dept Context</th>
              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', width: '150px' }}>Current Index Status</th>
            </tr>
          </thead>
          <tbody>
            {sheetRecords.map((record) => (
              <tr 
                key={record.roll_number}
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  background: record.status === 'Present' ? 'rgba(16, 185, 129, 0.03)' : 'transparent',
                  transition: 'background 0.2s ease'
                }}
              >
                <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    disabled={isLocked || loading}
                    checked={record.status === 'Present'}
                    onChange={() => handleCheckboxChange(record.roll_number)}
                    style={{ 
                      cursor: isLocked ? 'not-allowed' : 'pointer', 
                      width: '18px', 
                      height: '18px', 
                      accentColor: 'var(--accent-color)',
                      verticalAlign: 'middle'
                    }}
                  />
                </td>
                <td style={{ padding: '1rem 0.75rem', color: '#fff', fontWeight: '600', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                  {record.roll_number}
                </td>
                <td style={{ padding: '1rem 0.75rem', color: '#fff', fontWeight: '500' }}>
                  {record.full_name}
                </td>
                <td style={{ padding: '1rem 0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', border: '1px solid var(--border-color)', color: '#fff' }}>
                    {record.branch}
                  </span>
                </td>
                <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                  <span style={{
                    fontSize: '0.75rem', 
                    padding: '0.35rem 0.75rem', 
                    borderRadius: '4px', 
                    fontWeight: '700',
                    display: 'inline-block',
                    minWidth: '70px',
                    background: record.status === 'Present' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                    color: record.status === 'Present' ? '#10b981' : '#ef4444',
                    border: record.status === 'Present' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grid Update Commit Footer Action Control */}
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
        <button
          type="button"
          disabled={isLocked || loading}
          onClick={handleFormSubmit}
          className="submit-btn"
          style={{ width: 'auto', margin: 0, padding: '0.6rem 2rem', fontSize: '0.9rem' }}
        >
          {loading ? 'Committing Changes...' : 'Save & Lock Grid Layout'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceSheetGrid;