const express = require("express");

const router = express.Router();

const systemPermissionController = require("../controllers/systemPermissionController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add System Permission
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole("admin"),
    systemPermissionController.addPermission
);

// ======================================
// Get All System Permissions
// ======================================
router.get(
    "/",
    verifyToken,
    verifyRole("admin"),
    systemPermissionController.getAllPermissions
);

// ======================================
// Get System Permission By ID
// ======================================
router.get(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    systemPermissionController.getPermissionById
);

// ======================================
// Update System Permission
// ======================================
router.put(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    systemPermissionController.updatePermission
);

// ======================================
// Delete System Permission
// ======================================
router.delete(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    systemPermissionController.deletePermission
);

module.exports = router;