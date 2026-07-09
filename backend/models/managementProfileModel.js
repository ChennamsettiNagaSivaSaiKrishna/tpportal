const db = require("../config/db");

// ======================================
// Add Management Profile
// ======================================
exports.addManagementProfile = async (
    user_id,
    official_name,
    office_extension
) => {

    const [result] = await db.execute(
        `INSERT INTO management_profiles
        (
            user_id,
            official_name,
            office_extension
        )
        VALUES (?, ?, ?)`,
        [
            user_id,
            official_name,
            office_extension
        ]
    );

    return result;
};

// ======================================
// Get All Management Profiles
// ======================================
exports.getAllManagementProfiles = async () => {

    const [rows] = await db.execute(
        `SELECT mp.*,
                u.email,
                u.role
         FROM management_profiles mp
         LEFT JOIN users u
            ON mp.user_id = u.id
         ORDER BY mp.id DESC`
    );

    return rows;
};

// ======================================
// Get Management Profile By ID
// ======================================
exports.getManagementProfileById = async (id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM management_profiles
         WHERE id = ?`,
        [id]
    );

    return rows;
};

// ======================================
// Update Management Profile
// ======================================
exports.updateManagementProfile = async (
    id,
    user_id,
    official_name,
    office_extension
) => {

    const [result] = await db.execute(
        `UPDATE management_profiles
         SET
            user_id = ?,
            official_name = ?,
            office_extension = ?
         WHERE id = ?`,
        [
            user_id,
            official_name,
            office_extension,
            id
        ]
    );

    return result;
};

// ======================================
// Delete Management Profile
// ======================================
exports.deleteManagementProfile = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM management_profiles
         WHERE id = ?`,
        [id]
    );

    return result;
};