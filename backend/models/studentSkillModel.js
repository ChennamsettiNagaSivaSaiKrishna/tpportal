const db = require("../config/db");

// Add Skill
exports.addSkill = async (student_roll, skill_name) => {
    const [result] = await db.execute(
        `INSERT INTO student_skills (student_roll, skill_name)
         VALUES (?, ?)`,
        [student_roll, skill_name]
    );

    return result;
};

// Get Student Skills
exports.getStudentSkills = async (student_roll) => {
    const [rows] = await db.execute(
        `SELECT * FROM student_skills
         WHERE student_roll = ?`,
        [student_roll]
    );

    return rows;
};

// Get All Skills
exports.getAllSkills = async () => {
    const [rows] = await db.execute(
        `SELECT * FROM student_skills`
    );

    return rows;
};

// Update Skill
exports.updateSkill = async (id, skill_name) => {
    const [result] = await db.execute(
        `UPDATE student_skills
         SET skill_name = ?
         WHERE id = ?`,
        [skill_name, id]
    );

    return result;
};

// Delete Skill
exports.deleteSkill = async (id) => {
    const [result] = await db.execute(
        `DELETE FROM student_skills
         WHERE id = ?`,
        [id]
    );

    return result;
};