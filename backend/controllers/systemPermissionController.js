const systemPermissionModel = require("../models/systemPermissionModel");

// ======================================
// Add Permission
// ======================================
exports.addPermission = async (req, res) => {
    try {

        const {
            permission_key,
            description
        } = req.body;

        await systemPermissionModel.addPermission(
            permission_key,
            description
        );

        res.status(201).json({
            success: true,
            message: "System Permission Added Successfully"
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
// Get All Permissions
// ======================================
exports.getAllPermissions = async (req, res) => {
    try {

        const permissions =
            await systemPermissionModel.getAllPermissions();

        res.json({
            success: true,
            permissions
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
// Get Permission By ID
// ======================================
exports.getPermissionById = async (req, res) => {
    try {

        const permission =
            await systemPermissionModel.getPermissionById(
                req.params.id
            );

        res.json({
            success: true,
            permission
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
// Update Permission
// ======================================
exports.updatePermission = async (req, res) => {
    try {

        const {
            permission_key,
            description
        } = req.body;

        await systemPermissionModel.updatePermission(
            req.params.id,
            permission_key,
            description
        );

        res.json({
            success: true,
            message: "System Permission Updated Successfully"
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
// Delete Permission
// ======================================
exports.deletePermission = async (req, res) => {
    try {

        await systemPermissionModel.deletePermission(
            req.params.id
        );

        res.json({
            success: true,
            message: "System Permission Deleted Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};