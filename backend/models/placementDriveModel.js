const db = require("../config/db");

// ======================================
// Create Placement Drive
// ======================================
exports.createDrive = async (
    company_id,
    job_role,
    drive_date,
    min_cgpa_cutoff,
    max_backlogs_allowed
) => {

    const [result] = await db.execute(
        `INSERT INTO placement_drives
        (
            company_id,
            job_role,
            drive_date,
            min_cgpa_cutoff,
            max_backlogs_allowed
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            company_id,
            job_role,
            drive_date,
            min_cgpa_cutoff,
            max_backlogs_allowed
        ]
    );

    return result;
};

// ======================================
// Get All Drives
// ======================================
exports.getAllDrives = async () => {

    const [rows] = await db.execute(
        `SELECT
            pd.*,
            c.company_name,
            c.company_lpa,
            c.company_location
        FROM placement_drives pd
        INNER JOIN companies c
            ON pd.company_id = c.id
        ORDER BY pd.drive_date DESC`
    );

    return rows;
};

// ======================================
// Get Drive By ID
// ======================================
exports.getDriveById = async (id) => {

    const [rows] = await db.execute(
        `SELECT
            pd.*,
            c.company_name,
            c.company_lpa,
            c.company_location
        FROM placement_drives pd
        INNER JOIN companies c
            ON pd.company_id = c.id
        WHERE pd.id = ?`,
        [id]
    );

    return rows[0];
};

// ======================================
// Update Drive
// ======================================
exports.updateDrive = async (
    id,
    company_id,
    job_role,
    drive_date,
    min_cgpa_cutoff,
    max_backlogs_allowed,
    status
) => {

    const [result] = await db.execute(
        `UPDATE placement_drives
        SET
            company_id = ?,
            job_role = ?,
            drive_date = ?,
            min_cgpa_cutoff = ?,
            max_backlogs_allowed = ?,
            status = ?
        WHERE id = ?`,
        [
            company_id,
            job_role,
            drive_date,
            min_cgpa_cutoff,
            max_backlogs_allowed,
            status,
            id
        ]
    );

    return result;
};

// ======================================
// Delete Drive
// ======================================
exports.deleteDrive = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM placement_drives
        WHERE id = ?`,
        [id]
    );

    return result;
};