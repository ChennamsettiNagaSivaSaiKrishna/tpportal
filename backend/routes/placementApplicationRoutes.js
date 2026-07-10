const express = require("express");
const router = express.Router();

const placementApplicationController = require("../controllers/placementApplicationController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Student Apply for Placement Drive
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole("student"),
    placementApplicationController.applyDrive
);

// ======================================
// Student View Own Applications
// ======================================
router.get(
    "/student/:student_roll",
    verifyToken,
    verifyRole("student"),
    placementApplicationController.getStudentApplications
);

// ======================================
// Placement Officer View All Applications
// ======================================
router.get(
    "/",
    verifyToken,
    verifyRole("placement_officer"),
    placementApplicationController.getAllApplications
);

// ======================================
// Placement Officer Update Application Status
// ======================================
router.put(
    "/:id",
    verifyToken,
    verifyRole("placement_officer"),
    placementApplicationController.updateApplicationStatus
);

module.exports = router;