const db = require('../config/db'); // Your MySQL connection pool instance

// 1. Resolve User Rights dynamically from MySQL based on Role
// exports.getUserRights = async (req, res) => {
//   try {
//     const { role } = req.query;
//     if (!role) return res.status(400).json({ success: false, message: "Role parameter required" });

//     const query = `
//       SELECT DISTINCT p.permission_key AS right_name
//       FROM users u
//       JOIN role_permissions rp ON u.role = rp.role
//       JOIN permissions p ON rp.permission_key = p.permission_key
//       WHERE u.role = ?
//     `;

//     const [rows] = await db.query(query, [role]);
//     const rights = rows.map(row => row.right_name);

//     return res.status(200).json({ success: true, rights });
//   } catch (err) {
//     console.error("Error fetching dynamic rights:", err);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// 2. Fetch Full Matrix for Admin UI Dashboard
// exports.getAdminMatrix = async (req, res) => {
//   try {
//     const [permissions] = await db.query("SELECT * FROM permissions");
//     const [groups] = await db.query("SELECT * FROM permission_groups");
//     const [rolePermissions] = await db.query("SELECT * FROM role_permissions");

//     return res.status(200).json({ 
//       success: true, 
//       data: { permissions, groups, rolePermissions } 
//     });
//   } catch (err) {
//     console.error("Error fetching admin matrix:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// 3. Create a New Right/Permission (Matches error: createRight)
exports.createRight = async (req, res) => {
  const { permission_key, label_name, group_id, description } = req.body;
  try {
    await db.query(
      "INSERT INTO permissions (permission_key, label_name, group_id) VALUES (?, ?, ?)", 
      [permission_key, label_name, group_id || null]
    );
    return res.status(200).json({ success: true, message: "Right created successfully" });
  } catch (err) {
    console.error("Error creating right:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Get All Groups (Matches error: getGroups)
exports.getGroups = async (req, res) => {
  try {
    const [groups] = await db.query("SELECT * FROM permission_groups");
    return res.status(200).json({ success: true, groups });
  } catch (err) {
    console.error("Error fetching groups:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Create a New Group (Matches error: createGroup)
exports.createGroup = async (req, res) => {
  const { group_name, description } = req.body;
  try {
    await db.query(
      "INSERT INTO permission_groups (group_name, description) VALUES (?, ?)", 
      [group_name, description || ""]
    );
    return res.status(200).json({ success: true, message: "Group created successfully" });
  } catch (err) {
    console.error("Error creating group:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Assign Rights to Roles/Groups (Matches error: assignRightsToGroup)
exports.assignRightsToGroup = async (req, res) => {
  const { role, permission_keys } = req.body; // role string and array of permission keys
  try {
    // Clear existing mappings for this role
    await db.query("DELETE FROM role_permissions WHERE role = ?", [role]);

    // Insert new mappings
    if (permission_keys && permission_keys.length > 0) {
      for (let key of permission_keys) {
        await db.query(
          "INSERT INTO role_permissions (role, permission_key) VALUES (?, ?)", 
          [role, key]
        );
      }
    }

    return res.status(200).json({ success: true, message: "Role rights assigned successfully" });
  } catch (err) {
    console.error("Error assigning rights:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 7. Assign User Groups / Roles (Matches error: assignUserGroups)
exports.assignUserGroups = async (req, res) => {
  const { userId, role } = req.body;
  try {
    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    return res.status(200).json({ success: true, message: "User role updated successfully" });
  } catch (err) {
    console.error("Error updating user role:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 8. Fetch All System Rights / Permissions (Matches error: getRights)
exports.getRights = async (req, res) => {
  try {
    const [rights] = await db.query("SELECT * FROM permissions");
    return res.status(200).json({ success: true, rights });
  } catch (err) {
    console.error("Error fetching system rights:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


exports.getUserRights = async (req, res) => {
  try {
    const { role } = req.query;
    if (!role) return res.status(200).json({ success: true, rights: [] });

    const query = `
      SELECT DISTINCT r.name AS right_name
      FROM roles ro
      JOIN role_groups rg ON ro.id = rg.role_id
      JOIN groups g ON rg.group_id = g.id
      JOIN group_rights gr ON g.id = gr.group_id
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

// 2. Fetch Full Matrix for Admin Panel
exports.getAdminMatrix = async (req, res) => {
  try {
    const [roles] = await db.query("SELECT * FROM roles");
    const [groups] = await db.query("SELECT * FROM groups");
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

// 3. Create Entity (Role, Group, or Right)
exports.createEntity = async (req, res) => {
  const { type, name, description } = req.body;
  try {
    if (type === 'role') {
      await db.query("INSERT INTO roles (name, description) VALUES (?, ?)", [name, description || ""]);
    } else if (type === 'group') {
      await db.query("INSERT INTO groups (name, description) VALUES (?, ?)", [name, description || ""]);
    } else if (type === 'right') {
      await db.query("INSERT INTO rights (name, description) VALUES (?, ?)", [name, description || ""]);
    } else {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }
    return res.status(200).json({ success: true, message: `${type} created successfully` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Assign Mappings (Role <-> Groups OR Group <-> Rights)
exports.assignMapping = async (req, res) => {
  const { mappingType, primaryId, secondaryIds } = req.body; // mappingType: 'role_groups' or 'group_rights'
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
    }
    return res.status(200).json({ success: true, message: "Mapping updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Fetch All Users for Role Assignment Management
exports.getUsersList = async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, full_name, email, role FROM users");
    return res.status(200).json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Assign Role to User Live
exports.assignUserRole = async (req, res) => {
  const { userId, role } = req.body;
  try {
    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    return res.status(200).json({ success: true, message: "User role assigned successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


