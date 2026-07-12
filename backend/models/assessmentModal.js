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
        // 1. Log the initiation status and decrement attempts safely
        await db.query(
            `UPDATE student_skills 
             SET assessment_status = 'In-Progress', 
                 attempts_count = GREATEST(CAST(attempts_count AS SIGNED) - 1, 0) 
             WHERE student_roll = ? AND skill_name = ?`,
            [studentRoll, skillName]
        );
    
        // 2. FETCH QUESTIONS ARRAY MATCHING THE SECTOR TARGET
        const [questions] = await db.query(
            `SELECT id, question_text, option_a, option_b, option_c, option_d 
             FROM assessment_questions 
             WHERE LOWER(TRIM(skill_name)) = LOWER(TRIM(?)) 
             ORDER BY RAND() LIMIT 10`,
            [skillName]
        );
    
        // 3. DYNAMIC TIME RESOLUTION LOOKUP FROM THE DATABASE
        // If you have a separate skill meta table or use a fallback value column:
        const [meta] = await db.query(
            `SELECT duration_minutes FROM dynamic_skills_inventory 
             WHERE LOWER(TRIM(skill_name)) = LOWER(TRIM(?)) LIMIT 1`,
            [skillName]
        );
    
        // Dynamic Fallback Guard Rule: Use value from DB if found, otherwise default to 30
        const dynamicDuration = meta.length > 0 ? parseInt(meta[0].duration_minutes, 10) : 30;
    
        // Return an unified data bundle object back to your router controller
        return {
            questions: questions,
            durationMinutes: dynamicDuration
        };
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
    updateAssessmentResult: async (studentRoll, skillName, rating, status, passedClearance) => {
        // 1. Force dynamic values to solid defaults in Javascript memory scope
        const certificateUnlockedFlag = passedClearance ? 1 : 0;
        
        // Explicitly figure out numbers and strings right here before hitting SQL
        const isMalpractice = status === 'Malpractice' || (rating === 0 && status === 'Malpractice');
        
        const finalStatus = isMalpractice ? 'Malpractice' : status;
        
        // Explicitly override attempt count right here in the JS scope variables!
        // If it's a malpractice lockout, attempts go to 0. Otherwise, we don't update it (leave it out of SET, or read current)
        console.log(`[PROCTOR ENGINE DB] Committing to table. Roll: ${studentRoll}, Skill: ${skillName}, Status: ${finalStatus}`);
    
        let query = '';
        let queryParams = [];
    
        if (isMalpractice) {
            // Strict explicit update path for cheating lockouts
            query = `UPDATE student_skills 
                     SET rating = ?, 
                         assessment_status = ?, 
                         certificate_unlocked = ?,
                         attempts_count = 0
                     WHERE student_roll = ? AND skill_name = ?`;
            queryParams = [0, 'Malpractice', 0, String(studentRoll), String(skillName)];
        } else {
            // Standard baseline update path for genuine test runs
            query = `UPDATE student_skills 
                     SET rating = ?, 
                         assessment_status = ?, 
                         certificate_unlocked = ?
                     WHERE student_roll = ? AND skill_name = ?`;
            queryParams = [Number(rating), String(finalStatus), certificateUnlockedFlag, String(studentRoll), String(skillName)];
        }
    
        // Execute the cleanly split query bundle parameter array
        const [result] = await db.query(query, queryParams);
        return result;
    }
};

module.exports = Assessment;