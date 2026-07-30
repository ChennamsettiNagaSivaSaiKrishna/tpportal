import React, { useState, useEffect } from 'react';
import AttendanceSheetGrid from './AttendanceSheetGrid';
import API from '../../services/api';
import { useRights } from '../../context/RightsContext';

const AttendanceWorkspace = ({ isReadOnlyMode = false }) => {
  const { hasRight, loadingRights } = useRights();
  
  // 1. Dynamic RBAC Permission Evaluation from DB Rights
  // User can access workspace if they have rights to post attendance OR view attendance desk
  const hasModuleAccess = hasRight('NAV_MANAGE_ATTENDANCE') || hasRight('NAV_VIEW_ATTENDANCE_DESK');
  
  // User can modify/save attendance only if not in read-only mode AND has the BTN_POST_ATTENDANCE right in DB
  const canModifyAttendance = !isReadOnlyMode && hasRight('BTN_POST_ATTENDANCE');

  // 2. Control Layout Hooks States
  const [phases, setPhases] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionSlot, setSessionSlot] = useState('Morning_S1');
  
  const [studentsData, setStudentsData] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load phases on initial component mounting pipeline
  useEffect(() => {
    const fetchPhases = async () => {
      try {
        const res = await API.get('/attendance/phases');
        if (res.data && res.data.success) setPhases(res.data.data);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to populate training phases data structural arrays.' });
      }
    };
    if (hasModuleAccess) {
      fetchPhases();
    }
  }, [hasModuleAccess]);

  // Fetch contextual batches dynamically when phase selection switches
  useEffect(() => {
    if (!selectedPhase) return;
    const fetchBatches = async () => {
      try {
        const res = await API.get(`/attendance/phases/${selectedPhase}/batches`);
        if (res.data && res.data.success) {
          setBatches(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching phase batches:", err);
      }
    };
    fetchBatches();
  }, [selectedPhase]);

  // Load target attendance rows when batch, date, or slot values change
  const loadAttendanceSheet = async () => {
    if (!selectedBatch || !sessionDate || !sessionSlot) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await API.get('/attendance/sheet', {
        params: { batch_id: selectedBatch, date: sessionDate, slot: sessionSlot }
      });
      
      if (res.data && res.data.success) {
        setStudentsData(res.data.students || []);
        setActiveSessionId(res.data.session_id);
        // Lock grid if backend marks session locked OR if user lacks write rights in DB
        setIsLocked(!!res.data.session_locked || !canModifyAttendance);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed loading specific workflow tracking data sheet.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async (updatedRecords) => {
    if (!canModifyAttendance) {
      setMessage({ type: 'error', text: 'Operation blocked: Your profile lacks BTN_POST_ATTENDANCE rights.' });
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/attendance/save', {
        session_id: activeSessionId,
        attendance_records: updatedRecords
      });

      if (res.data && res.data.success) {
        setMessage({
          type: "success",
          text: "Attendance saved successfully!"
        });

        setTimeout(() => {
          loadAttendanceSheet();
        }, 1000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Transaction update verification mismatch on server layer.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingRights) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-sub)' }}>
        Resolving module access permissions...
      </div>
    );
  }

  if (!hasModuleAccess) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        🛑 Access Denied: Your assigned database rights do not grant access to the Attendance Workspace module.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '0.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--accent-color)', letterSpacing: '1px' }}>
          Training Management System Node
        </span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0.5rem 0 0 0', color: '#fff' }}>
          Dynamic Session Attendance Registry
        </h1>
      </div>

      {/* Control Selector Parameters Card Dropdowns Row */}
      <div className="glass-auth-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', padding: '1.5rem', marginBottom: '1.5rem', maxWidth: '100%' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Training Phase</label>
          <select 
            value={selectedPhase} 
            onChange={(e) => { setSelectedPhase(e.target.value); setSelectedBatch(''); }}
            className="form-input"
            style={{ width: '100%', cursor: 'pointer' }}
          >
            <option value="">Select Phase Matrix</option>
            {phases.map(p => <option key={p.id} value={p.id}>{p.phase_name}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Assigned Batch</label>
          <select 
            value={selectedBatch} 
            disabled={!selectedPhase}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="form-input"
            style={{ width: '100%', cursor: 'pointer' }}
          >
            <option value="">Select Target Batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Session Execution Date</label>
          <input 
            type="date" 
            value={sessionDate} 
            onChange={(e) => setSessionDate(e.target.value)}
            className="form-input"
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Session Allocation Slot</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select 
              value={sessionSlot} 
              onChange={(e) => setSessionSlot(e.target.value)}
              className="form-input"
              style={{ width: '100%', cursor: 'pointer' }}
            >
              <option value="Morning_S1">Morning Slot 1</option>
              <option value="Morning_S2">Morning Slot 2</option>
              <option value="Afternoon_S1">Afternoon Slot 1</option>
              <option value="Afternoon_S2">Afternoon Slot 2</option>
            </select>
            <button 
              onClick={loadAttendanceSheet}
              disabled={!selectedBatch}
              className="submit-btn"
              style={{ width: 'auto', margin: 0, padding: '0 1.25rem', whiteSpace: 'nowrap' }}
            >
              Fetch Grid
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '0.75rem 1rem', 
          borderRadius: '4px', 
          fontSize: '0.85rem', 
          marginBottom: '1rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Renders the tracking roster checkboxes grid block */}
      {studentsData.length > 0 ? (
        <AttendanceSheetGrid 
          students={studentsData} 
          isLocked={isLocked || !canModifyAttendance} 
          onSave={handleSaveAttendance} 
          loading={loading}
        />
      ) : (
        <div className="metric-panel-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-sub)', fontSize: '0.85rem' }}>
          Awaiting input variables. Configure parameters above and hit "Fetch Grid" to dynamically extract student rosters.
        </div>
      )}
    </div>
  );
};

export default AttendanceWorkspace;