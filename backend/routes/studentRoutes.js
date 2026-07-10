const placementOfficerController = require("../controllers/placementOfficerController");
const upload = require("../middleware/uploadMiddleware");
const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.get(
    "/departments-list",
    verifyToken,
    verifyRole("student"),
    studentController.getDepartmentsList
  );

// Test Route
router.get("/test", verifyToken, verifyRole("student"), studentController.test);

// Get Student Profile
router.get(
  "/profile",
  verifyToken,
  verifyRole("student"),
  studentController.profile
);


// Update Student Profile
router.put(
  "/profile",
  verifyToken,
  verifyRole("student"),
  studentController.updateProfile
);

router.post(
  "/resume",
  verifyToken,
  verifyRole("student"),
  upload.single("resume"),
  studentController.uploadResume
);

router.post(
  "/skills",
  verifyToken,
  verifyRole("student"),
  studentController.addSkill
);

router.get(
  "/skills",
  verifyToken,
  verifyRole("student"),
  studentController.getSkills
);
router.put(
  "/skills/:id",
  verifyToken,
  verifyRole("student"),
  studentController.updateSkill
);

router.delete(
  "/skills/:id",
  verifyToken,
  verifyRole("student"),
  studentController.deleteSkill
);
// View Placement Drives
router.get(
  "/drives",
  verifyToken,
  verifyRole("student"),
  placementOfficerController.getAllDrives
);

// Apply for Placement Drive
router.post(
  "/apply/:driveId",
  verifyToken,
  verifyRole("student"),
  placementOfficerController.applyDrive
);

// Get Student Dashboard Metrics (Applications, Verification, Drives)
router.get(
  "/dashboard-metrics",
  verifyToken,
  verifyRole("student"),
  studentController.getDashboardMetrics // We will write this controller method next
);


module.exports = router;
