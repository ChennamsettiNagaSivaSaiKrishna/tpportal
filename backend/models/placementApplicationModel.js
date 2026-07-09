const db = require("../config/db");

// Student Apply
exports.applyDrive = async (driveId, studentRoll) => {
    const [result] = await db.execute(
        `INSERT INTO placement_applications
        (drive_id, student_roll, current_status)
        VALUES (?, ?, ?)`,
        [driveId, studentRoll, "applied"]
    );

    return result;
};

// Student Applications
exports.getStudentApplications = async (studentRoll) => {
    const [rows] = await db.execute(
        `SELECT
            pa.*,
            pd.job_role,
            pd.drive_date,
            c.company_name
        FROM placement_applications pa
        JOIN placement_drives pd
            ON pa.drive_id = pd.id
        JOIN companies c
            ON pd.company_id = c.id
        WHERE pa.student_roll = ?`,
        [studentRoll]
    );

    return rows;
};

// Placement Officer - All Applications
exports.getAllApplications = async () => {
    const [rows] = await db.execute(
        `SELECT
            pa.*,
            pd.job_role,
            c.company_name
        FROM placement_applications pa
        JOIN placement_drives pd
            ON pa.drive_id = pd.id
        JOIN companies c
            ON pd.company_id = c.id`
    );

    return rows;
};

// Update Status
exports.updateStatus = async (id, status) => {
    const [result] = await db.execute(
        `UPDATE placement_applications
        SET current_status = ?
        WHERE id = ?`,
        [status, id]
    );

    return result;
};