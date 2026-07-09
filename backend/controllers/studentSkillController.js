const studentSkillModel = require("../models/studentSkillModel");

// Add Skill
exports.addSkill = async (req, res) => {
    try {

        const { student_roll, skill_name } = req.body;

        await studentSkillModel.addSkill(
            student_roll,
            skill_name
        );

        res.status(201).json({
            success: true,
            message: "Skill Added Successfully"
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Get Student Skills
exports.getStudentSkills = async (req, res) => {
    try {

        const skills =
            await studentSkillModel.getStudentSkills(
                req.params.student_roll
            );

        res.json({
            success: true,
            skills
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Get All Skills
exports.getAllSkills = async (req, res) => {
    try {

        const skills =
            await studentSkillModel.getAllSkills();

        res.json({
            success: true,
            skills
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Update Skill
exports.updateSkill = async (req, res) => {
    try {

        const { skill_name } = req.body;

        await studentSkillModel.updateSkill(
            req.params.id,
            skill_name
        );

        res.json({
            success: true,
            message: "Skill Updated Successfully"
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Delete Skill
exports.deleteSkill = async (req, res) => {
    try {

        await studentSkillModel.deleteSkill(req.params.id);

        res.json({
            success: true,
            message: "Skill Deleted Successfully"
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};