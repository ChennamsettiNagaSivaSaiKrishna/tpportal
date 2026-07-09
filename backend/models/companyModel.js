const db = require("../config/db");

// ===============================
// Add Company
// ===============================
exports.addCompany = async (
    company_name,
    company_lpa,
    company_location,
    is_msme,
    is_product_based,
    is_internship
) => {

    const [existing] = await db.execute(
        `SELECT id FROM companies WHERE company_name = ?`,
        [company_name]
    );

    if (existing.length > 0) {
        throw new Error("Company already exists");
    }

    const [result] = await db.execute(
        `INSERT INTO companies
        (
            company_name,
            company_lpa,
            company_location,
            is_msme,
            is_product_based,
            is_internship
        )
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            company_name,
            company_lpa,
            company_location,
            is_msme,
            is_product_based,
            is_internship
        ]
    );

    return result;
};

// ===============================
// Get All Companies
// ===============================
exports.getAllCompanies = async () => {

    const [rows] = await db.execute(
        `SELECT *
         FROM companies
         ORDER BY company_name ASC`
    );

    return rows;
};

// ===============================
// Get Company By ID
// ===============================
exports.getCompanyById = async (id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM companies
         WHERE id = ?`,
        [id]
    );

    return rows[0];
};

// ===============================
// Update Company
// ===============================
exports.updateCompany = async (
    id,
    company_name,
    company_lpa,
    company_location,
    is_msme,
    is_product_based,
    is_internship
) => {

    const [result] = await db.execute(
        `UPDATE companies
        SET
            company_name = ?,
            company_lpa = ?,
            company_location = ?,
            is_msme = ?,
            is_product_based = ?,
            is_internship = ?
        WHERE id = ?`,
        [
            company_name,
            company_lpa,
            company_location,
            is_msme,
            is_product_based,
            is_internship,
            id
        ]
    );

    return result;
};

// ===============================
// Delete Company
// ===============================
exports.deleteCompany = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM companies
         WHERE id = ?`,
        [id]
    );

    return result;
};