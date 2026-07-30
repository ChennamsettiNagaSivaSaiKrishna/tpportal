const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const verifyToken = require("../middleware/authMiddleware");
const rightMiddleware = require("../middleware/rightMiddleware");

const studentController = require("../controllers/studentController");
const placementOfficerController = require("../controllers/placementOfficerController");
const driveController = require("../controllers/driveController");

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Departments List
router.get(
  "/departments-list",
  verifyToken,
  studentController.getDepartmentsList
);

// Test Route
router.get("/test", verifyToken, studentController.test);

// Get Student Profile
router.get(
  "/profile",
  verifyToken,
  studentController.profile
);

// Update Student Profile
router.put(
  "/profile",
  verifyToken,
  studentController.updateProfile
);

// Resume Upload
router.post(
  "/resume",
  verifyToken,
  upload.single("resume"),
  studentController.uploadResume
);

// Skills Management Routes
router.post(
  "/skills",
  verifyToken,
  studentController.addSkill
);

router.get(
  "/skills",
  verifyToken,
  studentController.getSkills
);

router.put(
  "/skills/:id",
  verifyToken,
  studentController.updateSkill
);

router.delete(
  "/skills/:id",
  verifyToken,
  studentController.deleteSkill
);

// View Placement Drives
router.get(
  "/drives",
  verifyToken,
  placementOfficerController.getAllDrives
);

// Apply for Placement Drive
router.post(
  "/apply/:driveId",
  verifyToken,
  placementOfficerController.applyDrive
);

// Get Student Dashboard Metrics
router.get(
  "/dashboard-metrics",
  verifyToken,
  studentController.getDashboardMetrics
);

// Upcoming Hiring Drives
router.get(
  "/hiring-drives",
  verifyToken,
  driveController.getUpcomingHiringDrives
);

module.exports = router;