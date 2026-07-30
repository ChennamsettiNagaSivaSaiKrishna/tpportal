const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db'); // Ensure this points to your MySQL database configuration

// 1. Fetch the complete RBAC matrix grouped logically for the Admin UI Dashboard
router.get('/rbac-matrix', authMiddleware, async (req, res) => {
    try {
        const [groups] = await db.query(`SELECT * FROM permission_groups`);
        const [permissions] = await db.query(`SELECT * FROM permissions`);
        const [roleMappings] = await db.query(`SELECT * FROM role_permissions`);

        return res.status(200).json({
            success: true,
            groups,
            permissions,
            roleMappings
        });
    } catch (err) {
        console.error("Error fetching RBAC matrix:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Admin saves changes: enable or disable permissions for a given role dynamically
router.post('/update-role-permissions', authMiddleware, async (req, res) => {
    const { role, permissionKeys } = req.body; // permissionKeys = array of permission keys enabled by admin
    
    if (!role || !Array.isArray(permissionKeys)) {
        return res.status(400).json({ success: false, message: "Invalid payload format. 'role' and 'permissionKeys' array are required." });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Clear old mapping for the role
        await connection.query(`DELETE FROM role_permissions WHERE role = ?`, [role]);

        // Insert newly selected permissions
        for (const key of permissionKeys) {
            await connection.query(`INSERT INTO role_permissions (role, permission_key) VALUES (?, ?)`, [role, key]);
        }

        await connection.commit();
        connection.release();

        return res.status(200).json({ success: true, message: "Permissions successfully updated for role!" });
    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error("Error updating role permissions:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;