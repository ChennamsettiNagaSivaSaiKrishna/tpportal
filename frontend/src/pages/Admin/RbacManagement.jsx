import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";

const RbacManagement = () => {
  const [matrix, setMatrix] = useState({ 
    roles: [], 
    groups: [], 
    rights: [], 
    roleGroups: [], 
    groupRights: [] 
  });
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active view tab: 'roles_groups', 'groups_rights', or 'user_roles'
  const [activeSubTab, setActiveSubTab] = useState("roles_groups");
  
  // Selection & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrimaryId, setSelectedPrimaryId] = useState(null);
  const [assignedSecondaryIds, setAssignedSecondaryIds] = useState([]);

  // User Role Assignment state mapping tracker
  const [selectedUserRoleUpdates, setSelectedUserRoleUpdates] = useState({});

  // Creation Form States
  const [newType, setNewType] = useState("role"); 
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Custom Dropdown State
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);

  const entityTypesList = [
    { value: "role", label: "Role (e.g. coordinator)" },
    { value: "group", label: "Group (e.g. Placement Team)" },
    { value: "right", label: "Right (e.g. NAV_METRICS)" }
  ];

  // Close custom dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchMatrixAndUsers = async () => {
    try {
      setLoading(true);
      const [matrixRes, usersRes] = await Promise.all([
        API.get("/admin/rbac-matrix"),
        API.get("/admin/users-list").catch(() => ({ data: { users: [] } }))
      ]);

      if (matrixRes.data && matrixRes.data.success) {
        const payload = matrixRes.data.data || matrixRes.data;
        setMatrix({
          roles: payload.roles || [],
          groups: payload.groups || [],
          rights: payload.rights || [],
          roleGroups: payload.roleGroups || [],
          groupRights: payload.groupRights || []
        });
      }

      if (usersRes.data && usersRes.data.success) {
        setUsersList(usersRes.data.users || []);
      }
    } catch (err) {
      console.error("Error loading admin matrix data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrixAndUsers();
  }, []);

  useEffect(() => {
    if (!selectedPrimaryId) {
      setAssignedSecondaryIds([]);
      return;
    }
    if (activeSubTab === "roles_groups") {
      const roleGroups = matrix.roleGroups || [];
      const linked = roleGroups
        .filter(rg => Number(rg.role_id) === Number(selectedPrimaryId))
        .map(rg => rg.group_id);
      setAssignedSecondaryIds(linked);
    } else if (activeSubTab === "groups_rights") {
      const groupRights = matrix.groupRights || [];
      const linked = groupRights
        .filter(gr => Number(gr.group_id) === Number(selectedPrimaryId))
        .map(gr => gr.right_id);
      setAssignedSecondaryIds(linked);
    }
  }, [selectedPrimaryId, activeSubTab, matrix]);

  const handleCreateEntity = async () => {
    if (!newName.trim()) return alert("Name/Key cannot be empty");
    try {
      const res = await API.post("/admin/rbac-create", { type: newType, name: newName, description: newDesc });
      if (res.data && res.data.success) {
        alert(`${newType.toUpperCase()} created successfully!`);
        setNewName("");
        setNewDesc("");
        fetchMatrixAndUsers();
      }
    } catch (err) {
      alert("Error creating entity");
    }
  };

  const handleSaveMapping = async () => {
    if (!selectedPrimaryId) return alert("Please select a primary item first.");
    const mappingType = activeSubTab === "roles_groups" ? "role_groups" : "group_rights";
    try {
      const res = await API.post("/admin/rbac-assign", {
        mappingType,
        primaryId: selectedPrimaryId,
        secondaryIds: assignedSecondaryIds
      });
      if (res.data && res.data.success) {
        alert("Database mapping updated successfully!");
        fetchMatrixAndUsers();
      }
    } catch (err) {
      alert("Error saving mapping");
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const res = await API.post("/admin/assign-user-role", { userId, role: newRole });
      if (res.data && res.data.success) {
        alert("User role updated successfully in database!");
        fetchMatrixAndUsers();
      }
    } catch (err) {
      alert("Error assigning role to user");
    }
  };

  const filteredRoles = (matrix.roles || []).filter(r => (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredGroups = (matrix.groups || []).filter(g => (g.name || "").toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRights = (matrix.rights || []).filter(rt => (rt.name || "").toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredUsers = usersList.filter(u => (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div style={{ color: "var(--text-main)", padding: "2rem" }}>Loading Admin RBAC Desk...</div>;

  return (
    <div style={{ padding: "1.5rem", color: "var(--text-main)", background: "var(--bg-main)", minHeight: "100vh", boxSizing: "border-box", width: "100%" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.5rem", color: "var(--text-main)" }}>Admin Panel: Dynamic RBAC Manager</h1>
      <p style={{ color: "var(--text-sub)", fontSize: "0.85rem", marginBottom: "2rem" }}>Manage roles, groups, granular rights, and direct user role assignments live from the database.</p>

      {/* Creation Section */}
      <div style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border-color)", marginBottom: "2rem", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--text-main)" }}>Create New Entity</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", alignItems: "center" }}>
          
          {/* Custom Theme-Synced Dropdown Element */}
          <div ref={typeDropdownRef} style={{ position: "relative" }}>
            <div 
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              style={{ 
                padding: "0.75rem", 
                background: "var(--input-bg)", 
                color: "var(--text-main)", 
                border: "1px solid var(--border-color)", 
                borderRadius: "0.75rem", 
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.85rem"
              }}
            >
              <span>{entityTypesList.find(t => t.value === newType)?.label}</span>
              <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>▼</span>
            </div>

            {isTypeDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                background: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.75rem",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
                zIndex: 99,
                overflow: "hidden"
              }}>
                {entityTypesList.map(t => {
                  const isSelected = newType === t.value;
                  return (
                    <div 
                      key={t.value}
                      onClick={() => {
                        setNewType(t.value);
                        setIsTypeDropdownOpen(false);
                      }}
                      style={{
                        padding: "0.6rem 0.75rem",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        background: isSelected ? "var(--accent-color)" : "transparent",
                        color: isSelected ? "#ffffff" : "var(--text-main)",
                        fontWeight: isSelected ? "bold" : "normal"
                      }}
                    >
                      {t.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <input type="text" placeholder="Name / Key..." value={newName} onChange={e => setNewName(e.target.value)} style={{ padding: "0.75rem", background: "var(--input-bg)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", fontSize: "0.85rem", outline: "none" }} />
          <input type="text" placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{ padding: "0.75rem", background: "var(--input-bg)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", fontSize: "0.85rem", outline: "none" }} />
          <button onClick={handleCreateEntity} style={{ background: "var(--accent-color)", color: "#fff", padding: "0.75rem 1rem", border: "none", borderRadius: "0.75rem", cursor: "pointer", fontWeight: "bold" }}>Create & Save</button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border-color)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <button onClick={() => { setActiveSubTab("roles_groups"); setSelectedPrimaryId(null); }} style={{ padding: "0.5rem 1rem", background: activeSubTab === "roles_groups" ? "var(--accent-color)" : "var(--input-bg)", color: activeSubTab === "roles_groups" ? "#fff" : "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "0.5rem", marginRight: "0.75rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>1. Assign Groups to Roles</button>
            <button onClick={() => { setActiveSubTab("groups_rights"); setSelectedPrimaryId(null); }} style={{ padding: "0.5rem 1rem", background: activeSubTab === "groups_rights" ? "var(--accent-color)" : "var(--input-bg)", color: activeSubTab === "groups_rights" ? "#fff" : "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "0.5rem", marginRight: "0.75rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>2. Assign Rights to Groups</button>
            <button onClick={() => { setActiveSubTab("user_roles"); setSelectedPrimaryId(null); }} style={{ padding: "0.5rem 1rem", background: activeSubTab === "user_roles" ? "var(--accent-color)" : "var(--input-bg)", color: activeSubTab === "user_roles" ? "#fff" : "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>3. Assign Roles to Users</button>
          </div>
          <input type="text" placeholder="Search filter..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: "0.5rem 0.75rem", background: "var(--input-bg)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "0.5rem", width: "220px", fontSize: "0.85rem", outline: "none" }} />
        </div>

        {activeSubTab === "user_roles" ? (
          /* TAB 3: Assign Roles directly to Users */
          <div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--text-main)" }}>User Role Management Directory</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-sub)", fontSize: "0.8rem" }}>
                    <th style={{ padding: "0.75rem" }}>User Full Name</th>
                    <th style={{ padding: "0.75rem" }}>Email Account</th>
                    <th style={{ padding: "0.75rem" }}>Current Role Assigned</th>
                    <th style={{ padding: "0.75rem", textAlign: "right" }}>Assign New Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "0.75rem", fontWeight: "600", color: "var(--text-main)" }}>{u.full_name}</td>
                      <td style={{ padding: "0.75rem", color: "var(--text-sub)" }}>{u.email}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <span style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--accent-color)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "700" }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "right" }}>
                        <select 
                          defaultValue={u.role}
                          onChange={(e) => setSelectedUserRoleUpdates({ ...selectedUserRoleUpdates, [u.id]: e.target.value })}
                          style={{ padding: "0.4rem", background: "var(--input-bg)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "0.4rem", marginRight: "0.75rem", outline: "none", fontSize: "0.8rem" }}
                        >
                          {(matrix.roles || []).map(r => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleUpdateUserRole(u.id, selectedUserRoleUpdates[u.id] || u.role)} 
                          style={{ background: "var(--accent-color)", color: "#fff", padding: "0.4rem 0.85rem", border: "none", borderRadius: "0.4rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
                        >
                          Update Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TAB 1 & 2: Matrix Assignments */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
            <div>
              <h4 style={{ color: "var(--text-sub)", marginBottom: "0.5rem", fontSize: "0.85rem" }}>Select {activeSubTab === "roles_groups" ? "Role" : "Group"}</h4>
              <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "0.5rem", padding: "0.5rem", background: "var(--input-bg)" }}>
                {(activeSubTab === "roles_groups" ? filteredRoles : filteredGroups).map(item => (
                  <div key={item.id} onClick={() => setSelectedPrimaryId(item.id)} style={{ padding: "0.65rem", background: selectedPrimaryId === item.id ? "var(--accent-color)" : "transparent", color: selectedPrimaryId === item.id ? "#fff" : "var(--text-main)", cursor: "pointer", borderRadius: "0.4rem", marginBottom: "0.25rem", fontSize: "0.85rem", fontWeight: selectedPrimaryId === item.id ? "600" : "400" }}>
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ color: "var(--text-sub)", marginBottom: "0.5rem", fontSize: "0.85rem" }}>Assign {activeSubTab === "roles_groups" ? "Groups" : "Rights"}</h4>
              {selectedPrimaryId ? (
                <div>
                  <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "0.5rem", padding: "0.5rem", background: "var(--input-bg)" }}>
                    {(activeSubTab === "roles_groups" ? filteredGroups : filteredRights).map(subItem => (
                      <label key={subItem.id} style={{ display: "block", padding: "0.5rem", cursor: "pointer", color: "var(--text-main)", fontSize: "0.85rem" }}>
                        <input 
                          type="checkbox" 
                          checked={assignedSecondaryIds.includes(subItem.id)} 
                          onChange={e => {
                            if (e.target.checked) setAssignedSecondaryIds([...assignedSecondaryIds, subItem.id]);
                            else setAssignedSecondaryIds(assignedSecondaryIds.filter(id => id !== subItem.id));
                          }}
                          style={{ accentColor: "var(--accent-color)", marginRight: "0.75rem" }}
                        />
                        {subItem.name} <span style={{ color: "var(--text-sub)", fontSize: "0.75rem" }}>({subItem.description || ''})</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={handleSaveMapping} style={{ marginTop: "1rem", background: "var(--accent-color)", color: "#fff", padding: "0.6rem 1.25rem", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" }}>Save Database Mapping</button>
                </div>
              ) : (
                <p style={{ color: "var(--text-sub)", padding: "2rem 0", fontSize: "0.85rem" }}>Select a {activeSubTab === "roles_groups" ? "role" : "group"} on the left to configure assignments.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RbacManagement;