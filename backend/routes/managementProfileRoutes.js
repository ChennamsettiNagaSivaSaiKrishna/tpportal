const express = require("express");

const router = express.Router();

const managementProfileController = require("../controllers/managementProfileController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add Management Profile
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole("admin"),
    managementProfileController.addManagementProfile
);

// ======================================
// Get All Management Profiles
// ======================================
router.get(
    "/",
    verifyToken,
    verifyRole("admin"),
    managementProfileController.getAllManagementProfiles
);

// ======================================
// Get Management Profile By ID
// ======================================
router.get(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    managementProfileController.getManagementProfileById
);

// ======================================
// Update Management Profile
// ======================================
router.put(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    managementProfileController.updateManagementProfile
);

// ======================================
// Delete Management Profile
// ======================================
router.delete(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    managementProfileController.deleteManagementProfile
);

module.exports = router;