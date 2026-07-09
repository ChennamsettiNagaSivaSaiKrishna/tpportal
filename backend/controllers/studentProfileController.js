const studentProfileModel = require("../models/studentProfileModel");

// Create Student Profile
exports.createProfile = async (req, res) => {
    try {

        const {
            roll_number,
            user_id,
            department_id,
            full_name,
            mobile,
            cgpa,
            active_backlogs
        } = req.body;

        await studentProfileModel.createProfile(
            roll_number,
            user_id,
            department_id,
            full_name,
            mobile,
            cgpa,
            active_backlogs
        );

        res.status(201).json({
            success: true,
            message: "Student Profile Created Successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Get Student Profile
exports.getProfile = async (req, res) => {
    try {

        const profile =
            await studentProfileModel.getProfile(
                req.params.roll_number
            );

        res.json({
            success: true,
            profile
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Get All Student Profiles
exports.getAllProfiles = async (req, res) => {
    try {

        const profiles =
            await studentProfileModel.getAllProfiles();

        res.json({
            success: true,
            profiles
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Update Student Profile
exports.updateProfile = async (req, res) => {
    try {

        const {
            full_name,
            mobile,
            cgpa,
            active_backlogs
        } = req.body;

        await studentProfileModel.updateProfile(
            req.params.roll_number,
            full_name,
            mobile,
            cgpa,
            active_backlogs
        );

        res.json({
            success: true,
            message: "Student Profile Updated Successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Verify Student Profile
exports.verifyProfile = async (req, res) => {
    try {

        const {
            verification_status,
            is_eligible_for_drive
        } = req.body;

        await studentProfileModel.verifyProfile(
            req.params.roll_number,
            verification_status,
            is_eligible_for_drive
        );

        res.json({
            success: true,
            message: "Student Profile Verified Successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};