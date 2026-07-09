const db = require("../config/db");

// Get All Placement Drives
exports.getAllDrives = async () => {
    const [rows] = await db.query(`
        SELECT
            pd.*,
            c.company_name,
            c.company_lpa,
            c.company_location
        FROM placement_drives pd
        JOIN companies c
            ON pd.company_id = c.id
        ORDER BY pd.drive_date DESC
    `);

    return rows;
};

// Apply for Placement Drive
exports.applyDrive = async (driveId, studentRoll) => {
    await db.query(
        `INSERT INTO placement_applications
        (drive_id, student_roll, current_status)
        VALUES (?, ?, ?)`,
        [driveId, studentRoll, "Applied"]
    );
};