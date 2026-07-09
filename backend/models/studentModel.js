const db = require("../config/db");

// Get Student Profile
exports.getStudentProfile = async (userId) => {
    const [rows] = await db.query(
        `SELECT sp.*, d.dept_name
         FROM student_profiles sp
         JOIN departments d ON sp.department_id = d.id
         WHERE sp.user_id = ?`,
        [userId]
    );

    return rows[0];
};

// Update Student Profile
exports.updateStudentProfile = async (
    userId,
    full_name,
    mobile,
    cgpa,
    active_backlogs
) => {
    await db.query(
        `UPDATE student_profiles
         SET
            full_name = ?,
            mobile = ?,
            cgpa = ?,
            active_backlogs = ?
         WHERE user_id = ?`,
        [
            full_name,
            mobile,
            cgpa,
            active_backlogs,
            userId
        ]
    );
};

// Add Skill
exports.addSkill = async (userId, skill_name) => {

    const student = await this.getStudentProfile(userId);

    await db.query(
        `INSERT INTO student_skills
        (student_roll, skill_name)
        VALUES (?, ?)`,
        [
            student.roll_number,
            skill_name
        ]
    );
};

// View Skills
exports.getSkills = async (userId) => {

    const student = await this.getStudentProfile(userId);

    const [rows] = await db.query(
        `SELECT *
         FROM student_skills
         WHERE student_roll = ?`,
        [student.roll_number]
    );

    return rows;
};

// Update Skill
exports.updateSkill = async (skillId, skill_name) => {
    await db.query(
        `UPDATE student_skills
         SET skill_name = ?
         WHERE id = ?`,
        [skill_name, skillId]
    );
};

// Delete Skill
exports.deleteSkill = async (skillId) => {
    await db.query(
        `DELETE FROM student_skills
         WHERE id = ?`,
        [skillId]
    );
};