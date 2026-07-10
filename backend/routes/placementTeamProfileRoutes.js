const express = require("express");

const router = express.Router();

const placementTeamProfileController = require("../controllers/placementTeamProfileController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add Placement Team Profile
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole("admin"),
    placementTeamProfileController.addPlacementTeamProfile
);

// ======================================
// Get All Placement Team Profiles
// ======================================
router.get(
    "/",
    verifyToken,
    verifyRole("admin"),
    placementTeamProfileController.getAllPlacementTeamProfiles
);

// ======================================
// Get Placement Team Profile By ID
// ======================================
router.get(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    placementTeamProfileController.getPlacementTeamProfileById
);

// ======================================
// Update Placement Team Profile
// ======================================
router.put(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    placementTeamProfileController.updatePlacementTeamProfile
);

// ======================================
// Delete Placement Team Profile
// ======================================
router.delete(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    placementTeamProfileController.deletePlacementTeamProfile
);

module.exports = router;