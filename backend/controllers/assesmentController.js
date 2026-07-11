const Assessment = require("../models/assessmentModal");

// Retrieves the standard global checklist catalog payload
exports.fetchMasterCatalog = async (req, res) => {
    try {
        const inventory = await Assessment.getMasterInventory();
        return res.status(200).json({ success: true, inventory });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Failed to access catalog repositories.' });
    }
};

// Links a chosen skill node to the student's dashboard layout profile
exports.linkSkillToStudent = async (req, res) => {
    const { student_roll, skill_name } = req.body;
    try {
        await Assessment.addStudentSkillNode(student_roll, skill_name);
        return res.status(200).json({ success: true, message: 'Skill tracked securely inside database sheets.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'This skill node tracking path is already running.' });
        }
        return res.status(500).json({ success: false, message: 'Database transaction error logged.' });
    }
};

exports.startExamSession = async (req, res) => {
    const { studentRoll, skillName } = req.body;
    try {
        const metadata = await Assessment.getStudentSkillMeta(studentRoll, skillName);
        if (!metadata) return res.status(404).json({ success: false, message: 'Skill entry not verified.' });

        // FIX: Block attempts if they equal or exceed 3 OR if the student's status is permanently logged as 'Failed'
        if ((metadata.attempts_count >= 3 || metadata.assessment_status === 'Failed')) {
            return res.status(403).json({ 
                success: false, 
                maxAttemptsBreached: true, 
                message: 'Assessment blocked. Please contact your HOD or Admin for a re-test clearance token.' 
            });
        }

        const questions = await Assessment.getQuestionsForSkill(studentRoll, skillName);
        return res.status(200).json({ 
            success: true, 
            questions, 
            durationMinutes: metadata.duration_minutes 
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Session configuration error.' });
    }
};

exports.submitExamSession = async (req, res) => {
    const { studentRoll, skillName, answers, securityViolations } = req.body;
    try {
        // Rule 10: Automatic lock failure on structural anti-cheat triggers
        if (securityViolations >= 3) {
            await Assessment.updateAssessmentResult(studentRoll, skillName, 0, 'Failed', false);
            return res.status(200).json({ success: true, status: 'Failed', message: 'Security lockout failure logged.' });
        }

        const masterKeys = await Assessment.getAnswerKey(skillName);
        let correctCount = 0;
        
        masterKeys.forEach((q) => {
            if (answers[q.id] && answers[q.id] === q.correct_option) correctCount++;
        });

        const computedRating = masterKeys.length > 0 ? Math.round((correctCount / masterKeys.length) * 100) : 0;
        
        // Rule 9: Dynamic certificate access at a 60% baseline pass threshold
        const passedClearance = computedRating >= 60;
        const finalStatus = passedClearance ? 'Verified' : 'Failed';

        await Assessment.updateAssessmentResult(studentRoll, skillName, computedRating, finalStatus, passedClearance);

        return res.status(200).json({ success: true, status: finalStatus, rating: computedRating });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Evaluation processing pipeline error.' });
    }
};