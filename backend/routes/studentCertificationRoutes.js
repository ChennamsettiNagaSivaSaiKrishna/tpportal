const express = require("express");

const router = express.Router();

const studentCertificationController = require("../controllers/studentCertificationController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add Certification
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole("student"),
    studentCertificationController.addCertification
);

// ======================================
// Get Student Certifications
// ======================================
router.get(
    "/:student_roll",
    verifyToken,
    studentCertificationController.getStudentCertifications
);

// ======================================
// Get All Certifications
// ======================================
router.get(
    "/",
    verifyToken,
    verifyRole("placement_officer"),
    studentCertificationController.getAllCertifications
);

// ======================================
// Update Certification
// ======================================
router.put(
    "/:id",
    verifyToken,
    verifyRole("student"),
    studentCertificationController.updateCertification
);

// ======================================
// Delete Certification
// ======================================
router.delete(
    "/:id",
    verifyToken,
    verifyRole("student"),
    studentCertificationController.deleteCertification
);

module.exports = router;