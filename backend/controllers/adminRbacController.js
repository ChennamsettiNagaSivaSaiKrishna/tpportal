const db = require('../config/db'); // Your MySQL connection pool instance

// ==========================================
// 1. DYNAMIC USER RIGHTS RESOLUTION
// ==========================================
exports.getUserRights = async (req, res) => {
  try {
    const { role } = req.query;
    if (!role) return res.status(200).json({ success: true, rights: [] });

    const query = `
      SELECT DISTINCT r.name AS right_name
      FROM roles ro
      JOIN role_groups rg ON ro.id = rg.role_id
      JOIN tiers t ON rg.group_id = t.id
      JOIN group_rights gr ON t.id = gr.group_id
      JOIN rights r ON gr.right_id = r.id
      WHERE ro.name = ?
    `;
    const [rows] = await db.query(query, [role]);
    const rights = rows.map(row => row.right_name);

    return res.status(200).json({ success: true, rights });
  } catch (err) {
    console.error("Error fetching user rights:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 2. ADMIN PANEL MATRIX & ENTITY MANAGEMENT
// ==========================================
exports.getAdminMatrix = async (req, res) => {
  try {
    const [roles] = await db.query("SELECT * FROM roles");
    const [groups] = await db.query("SELECT * FROM tiers"); // Mapped cleanly to 'groups' variable for UI compatibility
    const [rights] = await db.query("SELECT * FROM rights");
    const [roleGroups] = await db.query("SELECT * FROM role_groups");
    const [groupRights] = await db.query("SELECT * FROM group_rights");

    return res.status(200).json({ 
      success: true, 
      data: { roles, groups, rights, roleGroups, groupRights } 
    });
  } catch (err) {
    console.error("Error fetching matrix:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createEntity = async (req, res) => {
  const { type, name, description } = req.body;
  try {
    if (type === 'role') {
      await db.query("INSERT INTO roles (name, description) VALUES (?, ?)", [name, description || ""]);
    } else if (type === 'group') {
      await db.query("INSERT INTO tiers (name, description) VALUES (?, ?)", [name, description || ""]);
    } else if (type === 'right') {
      await db.query("INSERT INTO rights (name, description) VALUES (?, ?)", [name, description || ""]);
    } else {
      return res.status(400).json({ success: false, message: "Invalid type specified" });
    }
    return res.status(200).json({ success: true, message: `${type} created successfully` });
  } catch (err) {
    console.error("Error creating entity:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.assignMapping = async (req, res) => {
  const { mappingType, primaryId, secondaryIds } = req.body; 
  try {
    if (mappingType === 'role_groups') {
      await db.query("DELETE FROM role_groups WHERE role_id = ?", [primaryId]);
      for (let gId of (secondaryIds || [])) {
        await db.query("INSERT INTO role_groups (role_id, group_id) VALUES (?, ?)", [primaryId, gId]);
      }
    } else if (mappingType === 'group_rights') {
      await db.query("DELETE FROM group_rights WHERE group_id = ?", [primaryId]);
      for (let rId of (secondaryIds || [])) {
        await db.query("INSERT INTO group_rights (group_id, right_id) VALUES (?, ?)", [primaryId, rId]);
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid mapping type" });
    }
    return res.status(200).json({ success: true, message: "Database mapping updated successfully" });
  } catch (err) {
    console.error("Error saving mapping:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 3. USER MANAGEMENT & DIRECTORY
// ==========================================
exports.getUsersList = async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, full_name, email, role FROM users");
    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users list:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.assignUserRole = async (req, res) => {
  const { userId, role } = req.body;
  try {
    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    return res.status(200).json({ success: true, message: "User role assigned successfully" });
  } catch (err) {
    console.error("Error updating user role:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 4. BACKWARD-COMPATIBILITY FALLBACK HANDLERS
// (Prevents router startup crashes from legacy endpoints)
// ==========================================
exports.getRights = async (req, res) => {
  try {
    const [rights] = await db.query("SELECT * FROM rights");
    return res.status(200).json({ success: true, rights });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRight = async (req, res) => {
  return exports.createEntity(req, res);
};

exports.getGroups = async (req, res) => {
  try {
    const [groups] = await db.query("SELECT * FROM tiers");
    return res.status(200).json({ success: true, groups });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createGroup = async (req, res) => {
  return exports.createEntity(req, res);
};

exports.assignRightsToGroup = async (req, res) => {
  return exports.assignMapping(req, res);
};

exports.assignUserGroups = async (req, res) => {
  return exports.assignUserRole(req, res);
};