const db = require("../config/db");

// Add Certification
exports.addCertification = async (student_roll, certification_name, issuing_organization, credential_url) => {
    const [result] = await db.execute(
        `INSERT INTO student_certifications
        (student_roll, certification_name, issuing_organization, credential_url)
        VALUES (?, ?, ?, ?)`,
        [student_roll, certification_name, issuing_organization, credential_url]
    );
    return result;
};

// Get Student Certifications
exports.getStudentCertifications = async (student_roll) => {
    const [rows] = await db.execute(
        `SELECT * FROM student_certifications
         WHERE student_roll = ?`,
        [student_roll]
    );
    return rows;
};

// Get All Certifications
exports.getAllCertifications = async () => {
    const [rows] = await db.execute(
        `SELECT * FROM student_certifications`
    );
    return rows;
};

// Update Certification
exports.updateCertification = async (id, certification_name, issuing_organization, credential_url) => {
    const [result] = await db.execute(
        `UPDATE student_certifications
         SET certification_name=?, issuing_organization=?, credential_url=?
         WHERE id=?`,
        [certification_name, issuing_organization, credential_url, id]
    );
    return result;
};

// Delete Certification
exports.deleteCertification = async (id) => {
    const [result] = await db.execute(
        `DELETE FROM student_certifications
         WHERE id=?`,
        [id]
    );
    return result;
};