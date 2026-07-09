const db = require("../config/db");

// ======================================
// Add Department
// ======================================
exports.addDepartment = async (
    dept_name,
    dept_full_name,
    hod_user_id,
    dept_mobile,
    dept_email
) => {

    const [result] = await db.execute(
        `INSERT INTO departments
        (
            dept_name,
            dept_full_name,
            hod_user_id,
            dept_mobile,
            dept_email
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            dept_name,
            dept_full_name,
            hod_user_id,
            dept_mobile,
            dept_email
        ]
    );

    return result;
};

// ======================================
// Get All Departments
// ======================================
exports.getAllDepartments = async () => {

    const [rows] = await db.execute(
        `SELECT d.*,
                u.email AS hod_email
         FROM departments d
         LEFT JOIN users u
           ON d.hod_user_id = u.id
         ORDER BY d.id DESC`
    );

    return rows;
};

// ======================================
// Get Department By ID
// ======================================
exports.getDepartmentById = async (id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM departments
         WHERE id = ?`,
        [id]
    );

    return rows;
};

// ======================================
// Update Department
// ======================================
exports.updateDepartment = async (
    id,
    dept_name,
    dept_full_name,
    hod_user_id,
    dept_mobile,
    dept_email
) => {

    const [result] = await db.execute(
        `UPDATE departments
         SET
            dept_name = ?,
            dept_full_name = ?,
            hod_user_id = ?,
            dept_mobile = ?,
            dept_email = ?
         WHERE id = ?`,
        [
            dept_name,
            dept_full_name,
            hod_user_id,
            dept_mobile,
            dept_email,
            id
        ]
    );

    return result;
};

// ======================================
// Delete Department
// ======================================
exports.deleteDepartment = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM departments
         WHERE id = ?`,
        [id]
    );

    return result;
};