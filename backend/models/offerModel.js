const db = require("../config/db");

// ======================================
// Add Offer
// ======================================
exports.addOffer = async (
    drive_id,
    student_roll,
    package_offered,
    offer_letter_url
) => {

    const [result] = await db.execute(
        `INSERT INTO offers
        (
            drive_id,
            student_roll,
            package_offered,
            offer_letter_url
        )
        VALUES (?, ?, ?, ?)`,
        [
            drive_id,
            student_roll,
            package_offered,
            offer_letter_url
        ]
    );

    return result;
};

// ======================================
// Get Student Offers
// ======================================
exports.getStudentOffers = async (student_roll) => {

    const [rows] = await db.execute(
        `SELECT
            o.*,
            pd.job_role,
            c.company_name
        FROM offers o
        JOIN placement_drives pd
            ON o.drive_id = pd.id
        JOIN companies c
            ON pd.company_id = c.id
        WHERE o.student_roll = ?
        ORDER BY o.id DESC`,
        [student_roll]
    );

    return rows;
};

// ======================================
// Get All Offers
// ======================================
exports.getAllOffers = async () => {

    const [rows] = await db.execute(
        `SELECT
            o.*,
            pd.job_role,
            c.company_name
        FROM offers o
        JOIN placement_drives pd
            ON o.drive_id = pd.id
        JOIN companies c
            ON pd.company_id = c.id
        ORDER BY o.id DESC`
    );

    return rows;
};

// ======================================
// Update Offer
// ======================================
exports.updateOffer = async (
    id,
    package_offered,
    offer_letter_url
) => {

    const [result] = await db.execute(
        `UPDATE offers
        SET
            package_offered = ?,
            offer_letter_url = ?
        WHERE id = ?`,
        [
            package_offered,
            offer_letter_url,
            id
        ]
    );

    return result;
};

// ======================================
// Student Accept / Reject
// ======================================
exports.acceptOffer = async (
    id,
    is_accepted_by_student
) => {

    const [result] = await db.execute(
        `UPDATE offers
        SET
            is_accepted_by_student = ?
        WHERE id = ?`,
        [
            is_accepted_by_student,
            id
        ]
    );

    return result;
};

// ======================================
// Delete Offer
// ======================================
exports.deleteOffer = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM offers
        WHERE id = ?`,
        [id]
    );

    return result;
};