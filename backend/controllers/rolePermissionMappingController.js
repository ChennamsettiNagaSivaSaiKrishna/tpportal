const rolePermissionMappingModel = require("../models/rolePermissionMappingModel");

// ======================================
// Add Role Permission
// ======================================
exports.addRolePermission = async (req, res) => {
    try {

        const {
            role,
            permission_id
        } = req.body;

        await rolePermissionMappingModel.addRolePermission(
            role,
            permission_id
        );

        res.status(201).json({
            success: true,
            message: "Role Permission Added Successfully"
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
// Get All Role Permissions
// ======================================
exports.getAllRolePermissions = async (req, res) => {
    try {

        const rolePermissions =
            await rolePermissionMappingModel.getAllRolePermissions();

        res.json({
            success: true,
            rolePermissions
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
// Get Role Permissions By Role
// ======================================
exports.getRolePermissionsByRole = async (req, res) => {
    try {

        const rolePermissions =
            await rolePermissionMappingModel.getRolePermissionsByRole(
                req.params.role
            );

        res.json({
            success: true,
            rolePermissions
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
// Delete Role Permission
// ======================================
exports.deleteRolePermission = async (req, res) => {
    try {

        await rolePermissionMappingModel.deleteRolePermission(
            req.params.role,
            req.params.permission_id
        );

        res.json({
            success: true,
            message: "Role Permission Deleted Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};