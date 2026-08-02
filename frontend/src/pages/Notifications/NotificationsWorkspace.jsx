import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const NotificationsWorkspace = () => {
  const [viewTab, setViewTab] = useState('compose'); 
  const [inboxItems, setInboxItems] = useState([]);
  const [recipientsList, setRecipientsList] = useState([]);
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageBanner, setMessageBanner] = useState({ type: '', text: '' });
  
  // State to securely track the current logged-in user's role context
  const [currentUserRole, setCurrentUserRole] = useState('');

  // Workspace configuration tracking properties
  const [editingId, setEditingId] = useState(null);
  const [editPayload, setEditPayload] = useState({ title: '', message: '' });

  const [searchFilters, setSearchFilters] = useState({
    globalQuery: '', role: '', departmentId: '', section: '', hodScope: 'ALL', broadcastMode: 'INDIVIDUAL'
  });

  const [formData, setFormData] = useState({
    title: '', message: '', priority: 'NORMAL', recipient_ids: []
  });

  const syncInbox = async () => {
    try {
      const res = await API.get('/notifications/inbox');
      if (res.data.success) setInboxItems(res.data.data);
    } catch (err) {
      console.error("Failed to fetch notification items layout:", err);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    debugger;
    try {
      const recipientsRes = await API.get('/notifications/eligible-recipients');
      if (recipientsRes.data.success) {
        setRecipientsList(recipientsRes.data.data);
        setFilteredRecipients(recipientsRes.data.data);
      }
      const studentsOnly = recipientsRes.data.data.filter(item => item.role === 'student');
      if (studentsOnly.length === 0) {
        setCurrentUserRole('student');
      }
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          debugger
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          console.log("Inside the method")
          if (payload && payload.role) {
            const parsedRole = payload.role.toLowerCase().trim();
            console.log(parsedRole,"---------------------------->parsedRole")
            setCurrentUserRole(parsedRole);
            
            if (parsedRole === 'student') {
              setSearchFilters(prev => ({ ...prev, role: '' }));
            }
          }
        } catch (e) {
          console.error("Failed to parse runtime token payload:", e);
        }
      }
      
      const deptsRes = await API.get('/student/departments-list');
      if (deptsRes.data.success) {
        setDepartments(deptsRes.data.departments || []);
      } else {
        setDepartments([
          { id: 1, dept_name: 'CSE' }, { id: 2, dept_name: 'CSM' },
          { id: 3, dept_name: 'CSD' }, { id: 4, dept_name: 'AIML' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setDepartments([{ id: 1, dept_name: 'CSE' }, { id: 2, dept_name: 'CSM' }, { id: 3, dept_name: 'CSD' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncInbox();
    loadInitialData();
    const liveTrackerInterval = setInterval(() => syncInbox(), 15000);
    return () => clearInterval(liveTrackerInterval);
  }, []);

  useEffect(() => {
    let result = [...recipientsList];
    const selectedRole = searchFilters.role.toLowerCase().trim();

    if (currentUserRole === 'student' && selectedRole === 'student') {
      setFilteredRecipients([]);
      return;
    }

    if (searchFilters.role) {
      result = result.filter(r => r.role.toLowerCase().trim() === selectedRole);
    }
    if (selectedRole === 'student') {
      if (searchFilters.departmentId) result = result.filter(r => Number(r.department_id) === Number(searchFilters.departmentId));
      if (searchFilters.section) result = result.filter(r => r.section.toLowerCase() === searchFilters.section.toLowerCase());
    } else if (selectedRole === 'hod') {
      if (searchFilters.hodScope === 'BRANCH' && searchFilters.departmentId) {
        result = result.filter(r => Number(r.department_id) === Number(searchFilters.departmentId));
      }
    }
    if (searchFilters.globalQuery.trim()) {
      const term = searchFilters.globalQuery.toLowerCase().trim();
      result = result.filter(r => 
        r.full_name.toLowerCase().includes(term) || r.email.toLowerCase().includes(term) || (r.roll_number && r.roll_number.toLowerCase().includes(term))
      );
    }
    if (searchFilters.role && searchFilters.broadcastMode === 'ROLE_GROUP') {
      setFormData(prev => ({ ...prev, recipient_ids: result.map(r => r.user_id) }));
    }
    setFilteredRecipients(result);
  }, [searchFilters, recipientsList, currentUserRole]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (formData.recipient_ids.length === 0) {
      setMessageBanner({ type: 'error', text: 'Please choose at least one valid destination recipient.' });
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/notifications/send', formData);
      if (res.data.success) {
        setMessageBanner({ type: 'success', text: 'Communication alert broadcast successfully.' });
        setFormData({ title: '', message: '', priority: 'NORMAL', recipient_ids: [] });
        syncInbox();
        setViewTab('inbox');
      }
    } catch (err) {
      setMessageBanner({ type: 'error', text: 'Failed to broadcast transaction payload.' });
    } finally {
      setLoading(false);
    }
  };

  const executeUpdatePayload = async (id) => {
    try {
      const res = await API.put(`/notifications/edit/${id}`, editPayload);
      if (res.data.success) {
        setEditingId(null);
        setMessageBanner({ type: 'success', text: 'Notification content saved and updated.' });
        syncInbox();
      }
    } catch (err) {
      setMessageBanner({ type: 'error', text: 'Unable to edit. Verification lock active after 15 minutes.' });
    }
  };

  const executeRecallPayload = async (id) => {
    if (!window.confirm("Are you sure you want to completely delete and recall this alert context?")) return;
    try {
      const res = await API.delete(`/notifications/delete/${id}`);
      if (res.data.success) {
        setMessageBanner({ type: 'success', text: 'Notification completely deleted from system matrices.' });
        syncInbox();
      }
    } catch (err) {
      setMessageBanner({ type: 'error', text: 'Delete action failed. Time limit window may have closed.' });
    }
  };

  // Helper utility function to supply clean dynamic CSS rules to tab switch elements
  const getTabStyle = (tabId) => {
    const isActive = viewTab === tabId;
    return {
      width: 'auto',
      margin: 0,
      padding: '0.6rem 1.5rem',
      fontSize: '0.9rem',
      fontWeight: '700',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease-in-out',
      background: isActive ? 'var(--accent-color, #a855f7)' : '#1e1e24',
      color: isActive ? '#ffffff' : '#9ca3af'
    };
  };

  return (
    <div style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--accent-color)' }}>Communication Hub Node</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0.5rem 0 0 0', color: '#fff' }}>System Notifications & Alerts</h1>
        </div>
        
        {/* ⚡ UPDATED COMPONENT BUTTON TAB PANEL ROW */}
        <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.35rem', borderRadius: '8px' }}>
          <button 
            onClick={() => setViewTab('inbox')} 
            style={getTabStyle('inbox')}
          >
            <span>📥</span> Inbox Matrix
          </button>
          <button 
            onClick={() => setViewTab('compose')} 
            style={getTabStyle('compose')}
          >
            <span>✍️</span> Compose Message
          </button>
        </div>
      </div>

      {messageBanner.text && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem', background: messageBanner.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: messageBanner.type === 'success' ? '#10b981' : '#ef4444', border: '1px solid rgba(255,255,255,0.1)' }}>
          {messageBanner.text}
        </div>
      )}

      {viewTab === 'inbox' ? (
        <div className="metric-panel-card" style={{ padding: '1.5rem' }}>
          {inboxItems.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-sub)' }}>Your notification dashboard registry is empty.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {inboxItems.map((item) => (
                <div key={item.notification_id || item.recipient_notification_id} style={{ padding: '1rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)', borderLeft: `4px solid ${item.is_my_outgoing ? '#3b82f6' : 'var(--accent-color)'}` }}>
                  
                  {editingId === item.notification_id ? (
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Edit Subject Heading</label>
                      <input type="text" className="form-input" value={editPayload.title} onChange={e => setEditPayload({...editPayload, title: e.target.value})} style={{ marginBottom: '0.5rem' }} />
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Edit Message Context</label>
                      <textarea className="form-input" rows="3" value={editPayload.message} onChange={e => setEditPayload({...editPayload, message: e.target.value})} style={{ marginBottom: '0.5rem' }}></textarea>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => executeUpdatePayload(item.notification_id)} className="submit-btn" style={{ width: 'auto', padding: '0.4rem 1.25rem', background: '#10b981', margin: 0 }}>💾 Save Modifications</button>
                        <button onClick={() => setEditingId(null)} className="submit-btn" style={{ width: 'auto', padding: '0.4rem 1.25rem', background: '#4b5563', margin: 0 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {item.title} 
                          {item.is_edited && <span style={{ color: 'var(--text-sub)', fontStyle: 'italic', fontSize: '0.75rem' }}>(edited)</span>}
                          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: item.priority === 'URGENT' ? '#ef4444' : item.priority === 'IMPORTANT' ? '#fbbf24' : '#1e293b' }}>{item.priority}</span>
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                      
                      <p style={{ color: '#ccc', fontSize: '0.9rem', margin: '0.6rem 0' }}>{item.message}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', pt: '0.25rem' }}>
                        <small style={{ color: item.is_my_outgoing ? '#3b82f6' : 'var(--accent-color)', fontWeight: '500' }}>
                          {item.is_my_outgoing ? `📤 Outgoing Broadcast (Sent by You)` : `📥 From: ${item.sender_name} [${item.sender_role.toUpperCase()}]`}
                        </small>
                        
                        {item.is_editable && (
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => { setEditingId(item.notification_id); setEditPayload({ title: item.title, message: item.message }); }} style={{ background: 'transparent', border: 'none', color: '#fbbf24', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>✍️ Edit</button>
                            <button onClick={() => executeRecallPayload(item.notification_id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>🗑️ Recall</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ width: '100%' }}>
{/* CONTROL FILTER ENGINE BAR */}
<div className="metric-panel-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
  <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-color)', display: 'block', marginBottom: '0.75rem' }}>🔍 Targeted Selection Filter Engine</span>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
    
    <div className="form-group" style={{ margin: 0 }}>
      <label className="form-label" style={{ fontSize: '0.75rem' }}>Systemic Role Context</label>
      <select value={searchFilters.role} onChange={(e) => { setSearchFilters({ ...searchFilters, role: e.target.value, departmentId: '', section: '', hodScope: 'ALL', broadcastMode: 'INDIVIDUAL' }); setFormData(prev => ({ ...prev, recipient_ids: [] })); }} className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', height: 'auto' }}>
        <option value="">Choose Targeted Workspace Role...</option>
        
        {currentUserRole !== 'student' && (
          <option value="student">Student Nodes</option>
        )}
        
        <option value="hod">Department HODs</option>
        <option value="placement_officer">Placement Officers</option>
        <option value="placement_coordinator">Coordinators</option>
        <option value="management">Management Panel</option>
      </select>
    </div>

    {/* 🚀 STUDENT FILTER DROP-DOWNS: Rendered ONLY for Placement Officers/Admins looking at students */}
    {searchFilters.role.toLowerCase() === 'student' && currentUserRole !== 'student' && (
      <>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Department Stream Branch</label>
          <select value={searchFilters.departmentId} onChange={(e) => setSearchFilters({ ...searchFilters, departmentId: e.target.value })} className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', height: 'auto' }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.dept_name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Section</label>
          <select value={searchFilters.section} onChange={(e) => setSearchFilters({ ...searchFilters, section: e.target.value })} className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', height: 'auto' }}>
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </>
    )}

    {/* 🚀 HOD SCOPE DROP-DOWNS: Hidden completely if the current user is a student */}
    {searchFilters.role.toLowerCase() === 'hod' && currentUserRole !== 'student' && (
      <>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>HOD Filter Scope</label>
          <select value={searchFilters.hodScope} onChange={(e) => setSearchFilters({ ...searchFilters, hodScope: e.target.value, departmentId: '' })} className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', height: 'auto' }}>
            <option value="ALL">All HODs</option>
            <option value="BRANCH">Specific Branch HOD</option>
          </select>
        </div>
        {searchFilters.hodScope === 'BRANCH' && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Branch</label>
            <select value={searchFilters.departmentId} onChange={(e) => setSearchFilters({ ...searchFilters, departmentId: e.target.value })} className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', height: 'auto' }}>
              <option value="">Select Department...</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.dept_name}</option>)}
            </select>
          </div>
        )}
      </>
    )}

    {searchFilters.role && !['student', 'hod'].includes(searchFilters.role.toLowerCase()) && (
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label" style={{ fontSize: '0.75rem' }}>Dispatch Target Scope</label>
        <select value={searchFilters.broadcastMode} onChange={(e) => { setSearchFilters({ ...searchFilters, broadcastMode: e.target.value, globalQuery: '' }); setFormData(prev => ({ ...prev, recipient_ids: [] })); }} className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', height: 'auto' }}>
          <option value="INDIVIDUAL">Particular Person (Select Below)</option>
          <option value="ROLE_GROUP">Broadcast to Entire Role Group</option>
        </select>
      </div>
    )}

    {searchFilters.broadcastMode !== 'ROLE_GROUP' && (
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Identity Keywords</label>
        <input type="text" value={searchFilters.globalQuery} onChange={(e) => setSearchFilters({ ...searchFilters, globalQuery: e.target.value })} placeholder="Search name, email..." className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} />
      </div>
    )}
  </div>
</div>

          <form onSubmit={handleSendMessage} className="glass-auth-card" style={{ width: '100%', padding: '2rem' }}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Target Recipient Address Node</label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Active Pool: <strong>{filteredRecipients.length}</strong> targets matching grid</span>
              </div>
              <select multiple disabled={searchFilters.broadcastMode === 'ROLE_GROUP'} value={formData.recipient_ids} onChange={(e) => setFormData({ ...formData, recipient_ids: Array.from(e.target.selectedOptions, option => parseInt(option.value, 10)) })} className="form-input" style={{ height: '160px', padding: '0.5rem', cursor: searchFilters.broadcastMode === 'ROLE_GROUP' ? 'not-allowed' : 'pointer', background: searchFilters.broadcastMode === 'ROLE_GROUP' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.2)', opacity: searchFilters.broadcastMode === 'ROLE_GROUP' ? 0.7 : 1 }} required>
                {searchFilters.broadcastMode === 'ROLE_GROUP' ? (
                  <option value="" disabled style={{ color: 'var(--accent-color)', fontWeight: 'bold', padding: '0.5rem' }}>📢 AUTOMATIC BROADCAST MODE ENABLED: Outbound to all matching {searchFilters.role.toUpperCase()} accounts.</option>
                ) : (
                  filteredRecipients.map(r => (
                    <option key={r.user_id} value={r.user_id} style={{ padding: '0.25rem', color: '#fff' }}>
                      [{r.role.toUpperCase()}] {r.full_name} {r.roll_number ? ` (Roll: ${r.roll_number})` : ''} {r.section ? ` [Sec: ${r.section}]` : ''} — {r.email}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">Subject Line Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="form-input" placeholder="Enter notification subject title..." required />
              </div>
              <div className="form-group">
                <label className="form-label">Transmission Priority Index</label>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="form-input">
                  <option value="NORMAL">Normal Delivery</option>
                  <option value="IMPORTANT">Important Flag Alert</option>
                  <option value="URGENT">Urgent Protocol Intervention</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Message Content Body Context</label>
              <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="form-input" rows="4" placeholder="Compose message body context details here..." required></textarea>
            </div>

            <button type="submit" disabled={loading || filteredRecipients.length === 0} className="submit-btn" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Transmitting Arrays...' : 'Broadcast Communication Payload'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default NotificationsWorkspace;