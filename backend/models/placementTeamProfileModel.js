const db = require("../config/db");

// ======================================
// Add Placement Team Profile
// ======================================
exports.addPlacementTeamProfile = async (
    user_id,
    staff_name,
    assigned_department_id,
    mobile
) => {

    const [result] = await db.execute(
        `INSERT INTO placement_team_profiles
        (
            user_id,
            staff_name,
            assigned_department_id,
            mobile
        )
        VALUES (?, ?, ?, ?)`,
        [
            user_id,
            staff_name,
            assigned_department_id,
            mobile
        ]
    );

    return result;
};

// ======================================
// Get All Placement Team Profiles
// ======================================
exports.getAllPlacementTeamProfiles = async () => {

    const [rows] = await db.execute(
        `SELECT ptp.*,
                u.email,
                d.dept_name
         FROM placement_team_profiles ptp
         LEFT JOIN users u
            ON ptp.user_id = u.id
         LEFT JOIN departments d
            ON ptp.assigned_department_id = d.id
         ORDER BY ptp.id DESC`
    );

    return rows;
};

// ======================================
// Get Placement Team Profile By ID
// ======================================
exports.getPlacementTeamProfileById = async (id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM placement_team_profiles
         WHERE id = ?`,
        [id]
    );

    return rows;
};

// ======================================
// Update Placement Team Profile
// ======================================
exports.updatePlacementTeamProfile = async (
    id,
    user_id,
    staff_name,
    assigned_department_id,
    mobile
) => {

    const [result] = await db.execute(
        `UPDATE placement_team_profiles
         SET
            user_id = ?,
            staff_name = ?,
            assigned_department_id = ?,
            mobile = ?
         WHERE id = ?`,
        [
            user_id,
            staff_name,
            assigned_department_id,
            mobile,
            id
        ]
    );

    return result;
};

// ======================================
// Delete Placement Team Profile
// ======================================
exports.deletePlacementTeamProfile = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM placement_team_profiles
         WHERE id = ?`,
        [id]
    );

    return result;
};