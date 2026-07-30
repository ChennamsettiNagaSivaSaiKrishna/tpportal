import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';

const RbacManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState('groups');
  const [rights, setRights] = useState([]);
  const [groups, setGroups] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  const [newRight, setNewRight] = useState({ right_code: '', right_type: 'TAB', description: '' });
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedRightIds, setSelectedRightIds] = useState([]);
  
  const [selectedUser, setSelectedStudentUser] = useState(null);
  const [selectedUserGroupIds, setSelectedUserGroupIds] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const loadRbacData = useCallback(async () => {
    setLoading(true);
    try {
      const [rightsRes, groupsRes, usersRes] = await Promise.all([
        API.get('/admin/rbac/rights'),
        API.get('/admin/rbac/groups'),
        API.get('/admin/users') // Existing admin user query API
      ]);

      if (rightsRes.data && rightsRes.data.success) setRights(rightsRes.data.rights || []);
      if (groupsRes.data && groupsRes.data.success) setGroups(groupsRes.data.groups || []);
      if (usersRes.data && usersRes.data.success) setUsersList(usersRes.data.users || usersRes.data.data || []);
    } catch (err) {
      console.error('Failed to query RBAC configuration matrix:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRbacData();
  }, [loadRbacData]);

  const handleCreateRight = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/admin/rbac/rights', newRight);
      if (res.data && res.data.success) {
        setMessage({ text: 'System right code registered successfully!', type: 'success' });
        setNewRight({ right_code: '', right_type: 'TAB', description: '' });
        loadRbacData();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error registering system right', type: 'error' });
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/admin/rbac/groups', { group_name: newGroupName });
      if (res.data && res.data.success) {
        setMessage({ text: 'Role/Group created successfully!', type: 'success' });
        setNewGroupName('');
        loadRbacData();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error creating group', type: 'error' });
    }
  };

  const handleSelectGroupToEdit = (group) => {
    setSelectedGroup(group);
    setSelectedRightIds(group.assigned_rights || []);
  };

  const handleRightToggle = (rightId) => {
    setSelectedRightIds(prev => 
      prev.includes(rightId) ? prev.filter(id => id !== rightId) : [...prev, rightId]
    );
  };

  const handleSaveGroupRights = async () => {
    if (!selectedGroup) return;
    try {
      const res = await API.post('/admin/rbac/groups/assign-rights', {
        group_id: selectedGroup.id,
        right_ids: selectedRightIds
      });
      if (res.data && res.data.success) {
        setMessage({ text: `Rights updated for group: ${selectedGroup.group_name}`, type: 'success' });
        loadRbacData();
      }
    } catch (err) {
      setMessage({ text: 'Failed to update group permission mappings', type: 'error' });
    }
  };

  const handleAssignUserGroups = async () => {
    if (!selectedUser) return;
    try {
      const res = await API.post('/admin/rbac/users/assign-group', {
        user_id: selectedUser.id,
        group_ids: selectedUserGroupIds
      });
      if (res.data && res.data.success) {
        setMessage({ text: `User ${selectedUser.email} assigned to selected groups successfully!`, type: 'success' });
        loadRbacData();
      }
    } catch (err) {
      setMessage({ text: 'Failed to map user to groups', type: 'error' });
    }
  };

  return (
    <div style={{ color: '#fff', width: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-color, #a855f7)', letterSpacing: '1px' }}>
          SYSTEM ADMINISTRATION CONTROL NODE
        </span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0.25rem 0 0 0' }}>
          Dynamic RBAC & Access Matrix Suite
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
          Dynamically declare rights, build new role groups, and assign users without redeploying code.
        </p>
      </div>

      {message.text && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: message.type === 'success' ? '#10b981' : '#ef4444', border: '1px solid rgba(255,255,255,0.05)' }}>
          {message.text}
        </div>
      )}

      {/* SUB-NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('groups')} 
          style={{ background: activeSubTab === 'groups' ? 'var(--accent-color, #a855f7)' : 'transparent', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
        >
          Group Permission Matrix
        </button>
        <button 
          onClick={() => setActiveSubTab('user_mapping')} 
          style={{ background: activeSubTab === 'user_mapping' ? 'var(--accent-color, #a855f7)' : 'transparent', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
        >
          User Role Mapping
        </button>
        <button 
          onClick={() => setActiveSubTab('rights')} 
          style={{ background: activeSubTab === 'rights' ? 'var(--accent-color, #a855f7)' : 'transparent', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
        >
          Register System Right Code
        </button>
      </div>

      {/* 1. GROUP / ROLE PERMISSION MATRIX */}
      {activeSubTab === 'groups' && (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1', minWidth: '280px', background: '#121620', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>1. Roles / Groups List</h3>
            <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="New Group (e.g. DEAN)" 
                value={newGroupName} 
                onChange={e => setNewGroupName(e.target.value)}
                required
                style={{ flex: 1, padding: '0.5rem', background: '#11141d', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
              />
              <button type="submit" style={{ padding: '0.5rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>+ Add</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {groups.map(g => (
                <div 
                  key={g.id} 
                  onClick={() => handleSelectGroupToEdit(g)}
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    background: selectedGroup?.id === g.id ? 'rgba(168, 85, 247, 0.2)' : '#181d2a',
                    border: selectedGroup?.id === g.id ? '1px solid #a855f7' : '1px solid transparent'
                  }}
                >
                  <strong>{g.group_name}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                    {g.assigned_rights?.length || 0} Rights Assigned
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: '2', minWidth: '350px', background: '#121620', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
              2. Assign System Rights {selectedGroup && <span style={{ color: 'var(--accent-color, #a855f7)' }}>({selectedGroup.group_name})</span>}
            </h3>
            
            {!selectedGroup ? (
              <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Select a role/group from the left pane to edit permissions.</p>
            ) : (
              <div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {rights.map(r => {
                    const isChecked = selectedRightIds.includes(r.id);
                    return (
                      <label key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: '#181d2a', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleRightToggle(r.id)} 
                        />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{r.right_code}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>[{r.right_type}] {r.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <button 
                  onClick={handleSaveGroupRights} 
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--accent-color, #a855f7)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save Permission Matrix
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2. USER TO GROUP MAPPING */}
      {activeSubTab === 'user_mapping' && (
        <div style={{ background: '#121620', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Map Registered User to Group Roles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Select Target Account</label>
              <select 
                style={{ width: '100%', padding: '0.6rem', background: '#11141d', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                onChange={e => {
                  const u = usersList.find(usr => usr.id === parseInt(e.target.value, 10));
                  setSelectedStudentUser(u || null);
                }}
              >
                <option value="">Choose User Account...</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>{u.email} (ID: {u.id})</option>
                ))}
              </select>
            </div>

            {selectedUser && (
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Select Assigned Groups</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {groups.map(g => (
                    <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#181d2a', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedUserGroupIds.includes(g.id)}
                        onChange={() => {
                          setSelectedUserGroupIds(prev => 
                            prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev, g.id]
                          );
                        }}
                      />
                      <span><strong>{g.group_name}</strong> - {g.description}</span>
                    </label>
                  ))}
                </div>

                <button 
                  onClick={handleAssignUserGroups}
                  style={{ padding: '0.65rem 1.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Commit User Mappings
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. REGISTER NEW RIGHT CODE */}
      {activeSubTab === 'rights' && (
        <div style={{ background: '#121620', padding: '1.5rem', borderRadius: '8px', maxWidth: '600px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Register New System Right Code</h3>
          <form onSubmit={handleCreateRight} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Right Code Identifier</label>
              <input 
                type="text" 
                placeholder="e.g. NAV_DEAN_DESK, BTN_EXPORT_REPORTS" 
                value={newRight.right_code}
                onChange={e => setNewRight({...newRight, right_code: e.target.value})}
                required
                style={{ width: '100%', padding: '0.5rem', background: '#11141d', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Right Type</label>
              <select 
                value={newRight.right_type}
                onChange={e => setNewRight({...newRight, right_type: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', background: '#11141d', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
              >
                <option value="TAB">TAB (Sidebar Navigation Item)</option>
                <option value="BUTTON">BUTTON (Action Trigger Button)</option>
                <option value="PAGE">PAGE (Full Route Access)</option>
                <option value="FEATURE">FEATURE (Widget/Section Component)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Description</label>
              <input 
                type="text" 
                placeholder="Describe operational feature granted" 
                value={newRight.description}
                onChange={e => setNewRight({...newRight, description: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', background: '#11141d', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
              />
            </div>

            <button type="submit" style={{ padding: '0.75rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem' }}>
              Register Right in Database
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default RbacManagement;