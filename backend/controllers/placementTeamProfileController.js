const placementTeamProfileModel = require("../models/placementTeamProfileModel");

// ======================================
// Add Placement Team Profile
// ======================================
exports.addPlacementTeamProfile = async (req, res) => {
    try {

        const {
            user_id,
            staff_name,
            assigned_department_id,
            mobile
        } = req.body;

        await placementTeamProfileModel.addPlacementTeamProfile(
            user_id,
            staff_name,
            assigned_department_id,
            mobile
        );

        res.status(201).json({
            success: true,
            message: "Placement Team Profile Added Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Get All Placement Team Profiles
// ======================================
exports.getAllPlacementTeamProfiles = async (req, res) => {
    try {

        const placementTeamProfiles =
            await placementTeamProfileModel.getAllPlacementTeamProfiles();

        res.json({
            success: true,
            placementTeamProfiles
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Get Placement Team Profile By ID
// ======================================
exports.getPlacementTeamProfileById = async (req, res) => {
    try {

        const placementTeamProfile =
            await placementTeamProfileModel.getPlacementTeamProfileById(
                req.params.id
            );

        res.json({
            success: true,
            placementTeamProfile
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Update Placement Team Profile
// ======================================
exports.updatePlacementTeamProfile = async (req, res) => {
    try {

        const {
            user_id,
            staff_name,
            assigned_department_id,
            mobile
        } = req.body;

        await placementTeamProfileModel.updatePlacementTeamProfile(
            req.params.id,
            user_id,
            staff_name,
            assigned_department_id,
            mobile
        );

        res.json({
            success: true,
            message: "Placement Team Profile Updated Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Delete Placement Team Profile
// ======================================
exports.deletePlacementTeamProfile = async (req, res) => {
    try {

        await placementTeamProfileModel.deletePlacementTeamProfile(
            req.params.id
        );

        res.json({
            success: true,
            message: "Placement Team Profile Deleted Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};