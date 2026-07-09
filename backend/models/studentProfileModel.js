const db = require("../config/db");

// Create Student Profile
exports.createProfile = async (
    roll_number,
    user_id,
    department_id,
    full_name,
    mobile,
    cgpa,
    active_backlogs
) => {

    const [result] = await db.execute(
        `INSERT INTO student_profiles
        (
            roll_number,
            user_id,
            department_id,
            full_name,
            mobile,
            cgpa,
            active_backlogs
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            roll_number,
            user_id,
            department_id,
            full_name,
            mobile,
            cgpa,
            active_backlogs
        ]
    );

    return result;
};

// Get Student Profile
exports.getProfile = async (roll_number) => {

    const [rows] = await db.execute(
        `SELECT *
        FROM student_profiles
        WHERE roll_number = ?`,
        [roll_number]
    );

    return rows;
};

// Get All Student Profiles
exports.getAllProfiles = async () => {

    const [rows] = await db.execute(
        `SELECT *
        FROM student_profiles`
    );

    return rows;
};

// Update Student Profile
exports.updateProfile = async (
    roll_number,
    full_name,
    mobile,
    cgpa,
    active_backlogs
) => {

    const [result] = await db.execute(
        `UPDATE student_profiles
        SET
            full_name = ?,
            mobile = ?,
            cgpa = ?,
            active_backlogs = ?
        WHERE roll_number = ?`,
        [
            full_name,
            mobile,
            cgpa,
            active_backlogs,
            roll_number
        ]
    );

    return result;
};

// Verify Student Profile
exports.verifyProfile = async (
    roll_number,
    verification_status,
    is_eligible_for_drive
) => {

    const [result] = await db.execute(
        `UPDATE student_profiles
        SET
            verification_status = ?,
            is_eligible_for_drive = ?
        WHERE roll_number = ?`,
        [
            verification_status,
            is_eligible_for_drive,
            roll_number
        ]
    );

    return result;
};