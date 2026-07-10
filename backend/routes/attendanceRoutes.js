const express = require("express");

const router = express.Router();

const attendanceController = require("../controllers/attendanceController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add Attendance
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole("trainings_head"),
    attendanceController.addAttendance
);

// ======================================
// Get All Attendance
// ======================================
router.get(
    "/",
    verifyToken,
    attendanceController.getAllAttendance
);

// ======================================
// Get Attendance By ID
// ======================================
router.get(
    "/:id",
    verifyToken,
    attendanceController.getAttendanceById
);

// ======================================
// Update Attendance
// ======================================
router.put(
    "/:id",
    verifyToken,
    verifyRole("trainings_head"),
    attendanceController.updateAttendance
);

// ======================================
// Delete Attendance
// ======================================
router.delete(
    "/:id",
    verifyToken,
    verifyRole("trainings_head"),
    attendanceController.deleteAttendance
);

module.exports = router;