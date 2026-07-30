const db = require('../config/db');

// 1. Get all registered system rights
const getRights = async (req, res) => {
  try {
    const [rights] = await db.execute('SELECT * FROM system_rights ORDER BY right_code ASC');
    return res.status(200).json({ success: true, rights });
  } catch (err) {
    console.error('Error fetching rights:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch rights' });
  }
};

// 2. Register a new system right code
const createRight = async (req, res) => {
  try {
    const { right_code, right_type, description } = req.body;
    if (!right_code) {
      return res.status(400).json({ success: false, message: 'Right code is required.' });
    }

    await db.execute(
      'INSERT INTO system_rights (right_code, right_type, description) VALUES (?, ?, ?)',
      [right_code.toUpperCase(), right_type || 'TAB', description || '']
    );

    return res.status(201).json({ success: true, message: 'System right registered successfully.' });
  } catch (err) {
    console.error('Error creating right:', err);
    return res.status(500).json({ success: false, message: 'Failed to create system right (It may already exist).' });
  }
};

// 3. Get all groups/roles and their assigned rights
const getGroups = async (req, res) => {
  try {
    const [groups] = await db.execute('SELECT * FROM user_groups ORDER BY group_name ASC');
    
    // Fetch assigned rights for each group
    const formattedGroups = await Promise.all(groups.map(async (group) => {
      const [assignedRights] = await db.execute(
        'SELECT right_id FROM group_rights WHERE group_id = ?',
        [group.id]
      );
      return {
        ...group,
        assigned_rights: assignedRights.map(r => r.right_id)
      };
    }));

    return res.status(200).json({ success: true, groups: formattedGroups });
  } catch (err) {
    console.error('Error fetching groups:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch groups' });
  }
};

// 4. Create a new user group/role
const createGroup = async (req, res) => {
  try {
    const { group_name, description } = req.body;
    if (!group_name) {
      return res.status(400).json({ success: false, message: 'Group name is required.' });
    }

    await db.execute(
      'INSERT INTO user_groups (group_name, description) VALUES (?, ?)',
      [group_name, description || '']
    );

    return res.status(201).json({ success: true, message: 'Group created successfully.' });
  } catch (err) {
    console.error('Error creating group:', err);
    return res.status(500).json({ success: false, message: 'Failed to create group.' });
  }
};

// 5. Assign/Update rights for a specific group (Permission Matrix Checkboxes)
const assignRightsToGroup = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { group_id, right_ids } = req.body; // right_ids is an array of right IDs
    if (!group_id || !Array.isArray(right_ids)) {
      return res.status(400).json({ success: false, message: 'Invalid payload provided.' });
    }

    await connection.beginTransaction();

    // Clear existing mappings for this group
    await connection.execute('DELETE FROM group_rights WHERE group_id = ?', [group_id]);

    // Insert new mappings
    for (const rightId of right_ids) {
      await connection.execute(
        'INSERT INTO group_rights (group_id, right_id) VALUES (?, ?)',
        [group_id, rightId]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({ success: true, message: 'Group permissions updated successfully.' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Error assigning group rights:', err);
    return res.status(500).json({ success: false, message: 'Failed to update group permission matrix.' });
  }
};

// 6. Assign user accounts to groups/roles
const assignUserGroups = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { user_id, group_ids } = req.body; // group_ids is an array of group IDs
    if (!user_id || !Array.isArray(group_ids)) {
      return res.status(400).json({ success: false, message: 'Invalid user mapping payload.' });
    }

    await connection.beginTransaction();

    // Clear existing user-to-group mappings
    await connection.execute('DELETE FROM user_group_mappings WHERE user_id = ?', [user_id]);

    // Insert new mappings
    for (const groupId of group_ids) {
      await connection.execute(
        'INSERT INTO user_group_mappings (user_id, group_id) VALUES (?, ?)',
        [user_id, groupId]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({ success: true, message: 'User role mappings updated successfully.' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Error assigning user groups:', err);
    return res.status(500).json({ success: false, message: 'Failed to map user to groups.' });
  }
};

module.exports = {
  getRights,
  createRight,
  getGroups,
  createGroup,
  assignRightsToGroup,
  assignUserGroups
};