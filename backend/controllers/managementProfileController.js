const managementProfileModel = require("../models/managementProfileModel");

// ======================================
// Add Management Profile
// ======================================
exports.addManagementProfile = async (req, res) => {
    try {

        const {
            user_id,
            official_name,
            office_extension
        } = req.body;

        await managementProfileModel.addManagementProfile(
            user_id,
            official_name,
            office_extension
        );

        res.status(201).json({
            success: true,
            message: "Management Profile Added Successfully"
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
// Get All Management Profiles
// ======================================
exports.getAllManagementProfiles = async (req, res) => {
    try {

        const managementProfiles =
            await managementProfileModel.getAllManagementProfiles();

        res.json({
            success: true,
            managementProfiles
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
// Get Management Profile By ID
// ======================================
exports.getManagementProfileById = async (req, res) => {
    try {

        const managementProfile =
            await managementProfileModel.getManagementProfileById(
                req.params.id
            );

        res.json({
            success: true,
            managementProfile
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
// Update Management Profile
// ======================================
exports.updateManagementProfile = async (req, res) => {
    try {

        const {
            user_id,
            official_name,
            office_extension
        } = req.body;

        await managementProfileModel.updateManagementProfile(
            req.params.id,
            user_id,
            official_name,
            office_extension
        );

        res.json({
            success: true,
            message: "Management Profile Updated Successfully"
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
// Delete Management Profile
// ======================================
exports.deleteManagementProfile = async (req, res) => {
    try {

        await managementProfileModel.deleteManagementProfile(
            req.params.id
        );

        res.json({
            success: true,
            message: "Management Profile Deleted Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};