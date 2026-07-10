const express = require("express");

const router = express.Router();

const rolePermissionMappingController = require("../controllers/rolePermissionMappingController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add Role Permission
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole("admin"),
    rolePermissionMappingController.addRolePermission
);

// ======================================
// Get All Role Permissions
// ======================================
router.get(
    "/",
    verifyToken,
    verifyRole("admin"),
    rolePermissionMappingController.getAllRolePermissions
);

// ======================================
// Get Role Permissions By Role
// ======================================
router.get(
    "/:role",
    verifyToken,
    verifyRole("admin"),
    rolePermissionMappingController.getRolePermissionsByRole
);

// ======================================
// Delete Role Permission
// ======================================
router.delete(
    "/:role/:permission_id",
    verifyToken,
    verifyRole("admin"),
    rolePermissionMappingController.deleteRolePermission
);

module.exports = router;