const express = require("express");

const router = express.Router();

const studentProfileController = require("../controllers/studentProfileController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// Create Student Profile
router.post(
    "/",
    verifyToken,
    verifyRole("student"),
    studentProfileController.createProfile
);

// Get Student Profile
router.get(
    "/:roll_number",
    verifyToken,
    studentProfileController.getProfile
);

// Get All Student Profiles
router.get(
    "/",
    verifyToken,
    verifyRole("placement_officer"),
    studentProfileController.getAllProfiles
);

// Update Student Profile
router.put(
    "/:roll_number",
    verifyToken,
    verifyRole("student"),
    studentProfileController.updateProfile
);

// Verify Student Profile
router.put(
    "/verify/:roll_number",
    verifyToken,
    verifyRole("placement_officer"),
    studentProfileController.verifyProfile
);

module.exports = router;