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

// exports.startExamSession = async (req, res) => {
//     const { studentRoll, skillName } = req.body;
//     try {
//         const metadata = await Assessment.getStudentSkillMeta(studentRoll, skillName);
//         if (!metadata) return res.status(404).json({ success: false, message: 'Skill entry not verified.' });

//         // FIX: Block attempts if they equal or exceed 3 OR if the student's status is permanently logged as 'Failed'
//         if ((metadata.attempts_count >= 3 || metadata.assessment_status === 'Failed')) {
//             return res.status(403).json({ 
//                 success: false, 
//                 maxAttemptsBreached: true, 
//                 message: 'Assessment blocked. Please contact your HOD or Admin for a re-test clearance token.' 
//             });
//         }

//         const questions = await Assessment.getQuestionsForSkill(studentRoll, skillName);
//         return res.status(200).json({ 
//             success: true, 
//             questions, 
//             durationMinutes: metadata.duration_minutes 
//         });
//     } catch (err) {
//         return res.status(500).json({ success: false, message: 'Session configuration error.' });
//     }
// };

// Ensure this matches the handler function wired to your POST /assessment/start route
exports.startExamSession = async (req, res) => {
    try {
        // 1. FIX: Map incoming camelCase properties from the frontend request payload
        const { studentRoll, skillName } = req.body;

        // Validation fallback guard to prevent passing undefined variables to SQL
        if (!studentRoll || !skillName) {
            return res.status(400).json({
                success: false,
                message: "Missing required properties: studentRoll and skillName are mandatory."
            });
        }

        console.log(`[BACKEND ROUTE] Initializing session parameters for Roll: ${studentRoll}, Skill: ${skillName}`);

        // 2. Invoke the model database transaction logic
        // Assumes your model file exports a method named getQuestionsForSkill
        const assessmentData = await Assessment.getQuestionsForSkill(studentRoll, skillName);
        // 3. FIX: Check if questions array exists and has contents before attempting to respond
        if (!assessmentData.questions || assessmentData.questions.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No question records matching this domain sector layout grid could be resolved.",
                questions: []
            });
        }
        
        return res.status(200).json({
            success: true,
            questions: assessmentData.questions,
            durationMinutes: assessmentData.durationMinutes // Handed down dynamically from DB column lookup!
        });

    } catch (error) {
        // Catches database or syntax exceptions and prints them safely to your terminal console
        console.error("CRITICAL EXCEPTION inside startAssessment handler:", error);
        
        return res.status(500).json({
            success: false,
            message: "Session configuration error." // This matches your exact error string!
        });
    }
};

exports.submitExamSession = async (req, res) => {
    const { studentRoll, skillName, answers, securityViolations } = req.body;
    
    try {
        // 1. FIX: Move this to the absolute top of the function
        // This short-circuits execution immediately on cheating detection, skipping the answer evaluation loop completely
        if (securityViolations !== undefined && parseInt(securityViolations, 10) >= 3) {
            console.warn(`[PROCTOR VIOLATION] Malpractice detected for student ${studentRoll} on skill ${skillName}. Triggering administrative lockout...`);
            
            await Assessment.updateAssessmentResult(studentRoll, skillName, 0, 'Malpractice', false);
            
            return res.status(200).json({ 
                success: true, 
                status: 'Malpractice', 
                rating: 0,
                message: 'Security lockout failure successfully logged in database.' 
            });
        }

        // 2. Standard Evaluation Node Logic (Runs only if security rules are intact)
        if (!answers) {
            return res.status(400).json({ success: false, message: "Missing answer choices data matrix bundle." });
        }

        const masterKeys = await Assessment.getAnswerKey(skillName);
        let correctCount = 0;
        
        masterKeys.forEach((q) => {
            if (answers && answers[q.id] && answers[q.id] === q.correct_option) {
                correctCount++;
            }
        });

        const computedRating = masterKeys.length > 0 ? Math.round((correctCount / masterKeys.length) * 100) : 0;
        const passedClearance = computedRating >= 60;
        const finalStatus = passedClearance ? 'Verified' : 'Failed';

        await Assessment.updateAssessmentResult(studentRoll, skillName, computedRating, finalStatus, passedClearance);

        return res.status(200).json({ success: true, status: finalStatus, rating: computedRating });

    } catch (err) {
        console.error("CRITICAL ERROR inside submitExamSession processing pipeline:", err);
        return res.status(500).json({ success: false, message: 'Evaluation processing pipeline error.' });
    }
};