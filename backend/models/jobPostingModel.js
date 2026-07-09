const db = require("../config/db");

// Add Job Posting
exports.addJobPosting = async (
    drive_id,
    company_id,
    job_title,
    job_description,
    salary_package,
    eligibility_criteria,
    application_deadline,
    posted_by_user_id
) => {

    const [result] = await db.execute(
        `INSERT INTO job_postings
        (
            drive_id,
            company_id,
            job_title,
            job_description,
            salary_package,
            eligibility_criteria,
            application_deadline,
            posted_by_user_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            drive_id,
            company_id,
            job_title,
            job_description,
            salary_package,
            eligibility_criteria,
            application_deadline,
            posted_by_user_id
        ]
    );

    return result;
};

// Get All Job Postings
exports.getAllJobPostings = async () => {

    const [rows] = await db.execute(
        `SELECT jp.*,
                c.company_name,
                pd.job_role
         FROM job_postings jp
         JOIN companies c
           ON jp.company_id = c.id
         LEFT JOIN placement_drives pd
           ON jp.drive_id = pd.id
         ORDER BY jp.id DESC`
    );

    return rows;
};

// Get Job Posting By ID
exports.getJobPostingById = async (id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM job_postings
         WHERE id = ?`,
        [id]
    );

    return rows;
};

// Update Job Posting
exports.updateJobPosting = async (
    id,
    drive_id,
    company_id,
    job_title,
    job_description,
    salary_package,
    eligibility_criteria,
    application_deadline
) => {

    const [result] = await db.execute(
        `UPDATE job_postings
         SET
            drive_id = ?,
            company_id = ?,
            job_title = ?,
            job_description = ?,
            salary_package = ?,
            eligibility_criteria = ?,
            application_deadline = ?
         WHERE id = ?`,
        [
            drive_id,
            company_id,
            job_title,
            job_description,
            salary_package,
            eligibility_criteria,
            application_deadline,
            id
        ]
    );

    return result;
};

// Delete Job Posting
exports.deleteJobPosting = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM job_postings
         WHERE id = ?`,
        [id]
    );

    return result;
};