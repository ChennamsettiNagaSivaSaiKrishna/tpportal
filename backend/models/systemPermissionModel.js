const db = require("../config/db");

// ======================================
// Add Permission
// ======================================
exports.addPermission = async (
    permission_key,
    description
) => {

    const [result] = await db.execute(
        `INSERT INTO system_permissions
        (
            permission_key,
            description
        )
        VALUES (?, ?)`,
        [
            permission_key,
            description
        ]
    );

    return result;
};

// ======================================
// Get All Permissions
// ======================================
exports.getAllPermissions = async () => {

    const [rows] = await db.execute(
        `SELECT *
         FROM system_permissions
         ORDER BY id DESC`
    );

    return rows;
};

// ======================================
// Get Permission By ID
// ======================================
exports.getPermissionById = async (id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM system_permissions
         WHERE id = ?`,
        [id]
    );

    return rows;
};

// ======================================
// Update Permission
// ======================================
exports.updatePermission = async (
    id,
    permission_key,
    description
) => {

    const [result] = await db.execute(
        `UPDATE system_permissions
         SET
            permission_key = ?,
            description = ?
         WHERE id = ?`,
        [
            permission_key,
            description,
            id
        ]
    );

    return result;
};

// ======================================
// Delete Permission
// ======================================
exports.deletePermission = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM system_permissions
         WHERE id = ?`,
        [id]
    );

    return result;
};