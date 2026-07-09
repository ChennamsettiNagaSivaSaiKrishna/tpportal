const studentModel = require("../models/studentModel");

// Test Route
exports.test = (req, res) => {
    res.json({
        success: true,
        message: "Student Controller Working"
    });
};

// Get Student Profile
exports.profile = async (req, res) => {
    try {
        const student = await studentModel.getStudentProfile(req.user.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        res.json({
            success: true,
            student
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Update Student Profile
exports.updateProfile = async (req, res) => {
    try {

        console.log("BODY RECEIVED:", req.body);

        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing"
            });
        }

        const {
            full_name,
            mobile,
            cgpa,
            active_backlogs
        } = req.body;

        await studentModel.updateStudentProfile(
            req.user.id,
            full_name,
            mobile,
            cgpa,
            active_backlogs
        );

        res.json({
            success: true,
            message: "Profile Updated Successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
// Upload Resume
exports.uploadResume = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF resume"
            });
        }

        res.json({
            success: true,
            message: "Resume Uploaded Successfully",
            file: req.file.filename
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// Add Skill
exports.addSkill = async (req, res) => {
    try {

        const { skill_name } = req.body;

        await studentModel.addSkill(req.user.id, skill_name);

        res.json({
            success: true,
            message: "Skill Added Successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// View Skills
exports.getSkills = async (req, res) => {
    try {

        const skills = await studentModel.getSkills(req.user.id);

        res.json({
            success: true,
            skills
        });

    } catch (error) {
        console.log(error);

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

        await studentModel.updateSkill(req.params.id, skill_name);

        res.json({
            success: true,
            message: "Skill Updated Successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Delete Skill
exports.deleteSkill = async (req, res) => {
    try {
        await studentModel.deleteSkill(req.params.id);

        res.json({
            success: true,
            message: "Skill Deleted Successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};