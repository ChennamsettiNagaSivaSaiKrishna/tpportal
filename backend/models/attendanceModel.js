const db = require("../config/db");

// Add Attendance
exports.addAttendance = async (
    student_roll,
    session_id,
    is_present,
    marked_by_user_id
) => {

    const [result] = await db.execute(
        `INSERT INTO attendance
        (
            student_roll,
            session_id,
            is_present,
            marked_by_user_id
        )
        VALUES (?, ?, ?, ?)`,
        [
            student_roll,
            session_id,
            is_present,
            marked_by_user_id
        ]
    );

    return result;
};

// Get All Attendance
exports.getAllAttendance = async () => {

    const [rows] = await db.execute(
        `SELECT *
         FROM attendance
         ORDER BY id DESC`
    );

    return rows;
};

// Get Attendance By ID
exports.getAttendanceById = async (id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM attendance
         WHERE id = ?`,
        [id]
    );

    return rows;
};

// Update Attendance
exports.updateAttendance = async (
    id,
    student_roll,
    session_id,
    is_present,
    marked_by_user_id
) => {

    const [result] = await db.execute(
        `UPDATE attendance
         SET
            student_roll = ?,
            session_id = ?,
            is_present = ?,
            marked_by_user_id = ?
         WHERE id = ?`,
        [
            student_roll,
            session_id,
            is_present,
            marked_by_user_id,
            id
        ]
    );

    return result;
};

// Delete Attendance
exports.deleteAttendance = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM attendance
         WHERE id = ?`,
        [id]
    );

    return result;
};