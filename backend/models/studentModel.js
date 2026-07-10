const db = require("../config/db");

// ==========================================
// CORE DATA EXTRACTION QUERIES
// ==========================================

/**
 * Get Student Profile using verified User ID
 */
exports.getStudentProfileById = async (userId) => {
    const [rows] = await db.query(
        `SELECT sp.*, d.dept_name, u.email
         FROM student_profiles sp
         LEFT JOIN departments d ON sp.department_id = d.id
         JOIN users u ON sp.user_id = u.id
         WHERE sp.user_id = ?`,
        [userId]
    );
    return rows[0];
};

/**
 * Upsert Student Profile Data
 * Handles initial insertion and updates cleanly based on your exact schema.
 */
exports.updateStudentProfile = async (
    userId,
    full_name,
    mobile,
    cgpa,
    active_backlogs,
    roll_number,
    department_id // Dynamic parameter
) => {
    const [existing] = await db.query(
        `SELECT roll_number FROM student_profiles WHERE user_id = ?`,
        [userId]
    );

    if (existing.length === 0) {
        await db.query(
            `INSERT INTO student_profiles 
             (roll_number, user_id, department_id, full_name, mobile, cgpa, active_backlogs, verification_status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                roll_number,
                userId,
                department_id,
                full_name,
                mobile,
                cgpa,
                active_backlogs
            ]
        );
    } else {
        await db.query(
            `UPDATE student_profiles
             SET
                full_name = ?,
                mobile = ?,
                cgpa = ?,
                active_backlogs = ?,
                roll_number = ?,
                department_id = ?
             WHERE user_id = ?`,
            [
                full_name,
                mobile,
                cgpa,
                active_backlogs,
                roll_number,
                department_id,
                userId
            ]
        );
    }
};

// ==========================================
// PORTAL VISUALIZATION ANALYTICS
// ==========================================

/**
 * Pull dynamic metric card data summaries safely based on schema attributes
 */
exports.getDashboardMetrics = async (userId) => {
    // 1. Fetch profile fields using your exact column keys
    const [profileRows] = await db.query(
        `SELECT roll_number, verification_status FROM student_profiles WHERE user_id = ?`,
        [userId]
    );

    // If the student hasn't completed onboarding yet, return empty summaries
    if (profileRows.length === 0) {
        return {
            applications: 0,
            verified: false,
            drives: 0
        };
    }

    const studentRoll = profileRows[0].roll_number;
    const status = profileRows[0].verification_status;

    // 2. Count applications using the correct 'student_roll' foreign key column
    const [appRows] = await db.query(
        `SELECT COUNT(*) as count FROM placement_applications WHERE student_roll = ?`,
        [studentRoll]
    );

    // 3. Count active placement drives
    const [driveRows] = await db.query(
        `SELECT COUNT(*) as count FROM placement_drives WHERE status = 'active' OR status = 'ongoing'`
    );

    return {
        applications: appRows[0]?.count || 0,
        verified: status === 'verified',
        drives: driveRows[0]?.count || 0
    };
};

// ==========================================
// SKILLS MANAGEMENT PIPELINES
// ==========================================
exports.addSkill = async (userId, skill_name, rating) => {
    const student = await this.getStudentProfileByUserId(userId);
    if (!student) throw new Error("Profile must be initialized first.");

    await db.query(
        `INSERT INTO student_skills (student_roll, skill_name, rating) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
        [student.roll_number, skill_name, rating || 70] // default fallback rating
    );
};

exports.getSkills = async (userId) => {
    const student = await this.getStudentProfileById(userId);
    if (!student) return [];

    const [rows] = await db.query(
        `SELECT * FROM student_skills WHERE student_roll = ?`,
        [student.roll_number]
    );
    return rows;
};

exports.updateSkill = async (skillId, skill_name) => {
    await db.query(`UPDATE student_skills SET skill_name = ? WHERE id = ?`, [skill_name, skillId]);
};

exports.deleteSkill = async (skillId) => {
    await db.query(`DELETE FROM student_skills WHERE id = ?`, [skillId]);
};

/**
 * Fetch all available departments to populate the frontend onboarding dropdown selection
 */
exports.getAllDepartments = async () => {
    const [rows] = await db.query(`SELECT id, dept_name, dept_full_name FROM departments ORDER BY dept_name ASC`);
    return rows;
};

