const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// 🛠️ Debug Check Strategy: Asserts that all handlers are mapped properly before registering
console.log("[Router Verification Check]:", {
    getAllPhases: typeof attendanceController.getAllPhases,
    getBatchesByPhase: typeof attendanceController.getBatchesByPhase,
    getAttendanceSheet: typeof attendanceController.getAttendanceSheet,
    saveAttendanceGrid: typeof attendanceController.saveAttendanceGrid,
    getStudentAttendanceHistory: typeof attendanceController.getStudentAttendanceHistory // 🚀 Added to tracking block
});

// Primary Endpoint Route Mappings
router.get('/phases', attendanceController.getAllPhases);
router.get('/phases/:phaseId/batches', attendanceController.getBatchesByPhase);
router.get('/sheet', attendanceController.getAttendanceSheet);
router.post('/save', attendanceController.saveAttendanceGrid);

// 🚀 NEW: Route mapping to fetch the history logs for an individual student
router.get('/student/:rollNumber', attendanceController.getStudentAttendanceHistory);

module.exports = router;