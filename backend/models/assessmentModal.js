const db = require('../config/db');

const Assessment = {
    // Fetches the entire master checklist from the dynamic_skills_inventory catalog table
    getMasterInventory: async () => {
        const [rows] = await db.query(
            'SELECT id, skill_name, category FROM dynamic_skills_inventory ORDER BY skill_name ASC'
        );
        return rows;
    },

    // Tracks a fresh master skill node inside the student's personalized matrix row map
    addStudentSkillNode: async (studentRoll, skillName) => {
        const [result] = await db.query(
            'INSERT INTO student_skills (student_roll, skill_name, rating, assessment_status) VALUES (?, ?, 0, "Not Initiated")',
            [studentRoll, skillName]
        );
        return result;
    },

    // Restricts concurrent test initialization and loads proctored questions matching the skill name
    getQuestionsForSkill: async (studentRoll, skillName) => {
        // Step A: Update local status token state to 'In-Progress'
        await db.query(
            "UPDATE student_skills SET assessment_status = 'In-Progress' WHERE student_roll = ? AND skill_name = ?",
            [studentRoll, skillName]
        );

        // Step B: Fetch random evaluation metrics items from the question pool bank
        const [questions] = await db.query(
            'SELECT id, question_text, option_a, option_b, option_c, option_d FROM assessment_questions WHERE skill_name = ? ORDER BY RAND() LIMIT 10',
            [skillName]
        );
        return questions;
    },

    // Fetches the master server answer key directly to cross-verify client choices safely
    getAnswerKey: async (skillName) => {
        const [rows] = await db.query(
            'SELECT id, correct_option FROM assessment_questions WHERE skill_name = ?',
            [skillName]
        );
        return rows;
    },

    // Writes the verified grades or updates the terminal failure status directly to the record matrix row
    updateAssessmentResult: async (studentRoll, skillName, rating, status) => {
        const [result] = await db.query(
            'UPDATE student_skills SET rating = ?, assessment_status = ? WHERE student_roll = ? AND skill_name = ?',
            [rating, status, studentRoll, skillName]
        );
        return result;
    }
};

module.exports = Assessment;