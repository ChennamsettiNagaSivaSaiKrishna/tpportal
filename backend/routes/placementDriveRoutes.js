const express = require("express");
const router = express.Router();

const placementDriveController = require("../controllers/placementDriveController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

// Create Drive
router.post(
    "/",
    verifyToken,
    verifyRole("placement_officer"),
    placementDriveController.createDrive
);

// Get All Drives
router.get(
    "/",
    verifyToken,
    placementDriveController.getAllDrives
);

// Get Drive By ID
router.get(
    "/:id",
    verifyToken,
    placementDriveController.getDriveById
);

// Update Drive
router.put(
    "/:id",
    verifyToken,
    verifyRole("placement_officer"),
    placementDriveController.updateDrive
);

// Delete Drive
router.delete(
    "/:id",
    verifyToken,
    verifyRole("placement_officer"),
    placementDriveController.deleteDrive
);

module.exports = router;