const db = require("../config/db");

// ======================================
// Add Role Permission
// ======================================
exports.addRolePermission = async (
    role,
    permission_id
) => {

    const [result] = await db.execute(
        `INSERT INTO role_permissions_mapping
        (
            role,
            permission_id
        )
        VALUES (?, ?)`,
        [
            role,
            permission_id
        ]
    );

    return result;
};

// ======================================
// Get All Role Permissions
// ======================================
exports.getAllRolePermissions = async () => {

    const [rows] = await db.execute(
        `SELECT rpm.role,
                rpm.permission_id,
                sp.permission_key,
                sp.description
         FROM role_permissions_mapping rpm
         JOIN system_permissions sp
           ON rpm.permission_id = sp.id
         ORDER BY rpm.role ASC`
    );

    return rows;
};

// ======================================
// Get Role Permissions By Role
// ======================================
exports.getRolePermissionsByRole = async (role) => {

    const [rows] = await db.execute(
        `SELECT rpm.role,
                rpm.permission_id,
                sp.permission_key,
                sp.description
         FROM role_permissions_mapping rpm
         JOIN system_permissions sp
           ON rpm.permission_id = sp.id
         WHERE rpm.role = ?`,
        [role]
    );

    return rows;
};

// ======================================
// Delete Role Permission
// ======================================
exports.deleteRolePermission = async (
    role,
    permission_id
) => {

    const [result] = await db.execute(
        `DELETE FROM role_permissions_mapping
         WHERE role = ?
         AND permission_id = ?`,
        [
            role,
            permission_id
        ]
    );

    return result;
};