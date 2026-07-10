const express = require("express");

const router = express.Router();

const departmentController = require("../controllers/departmentController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add Department
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole("admin"),
    departmentController.addDepartment
);

// ======================================
// Get All Departments
// ======================================
router.get(
    "/",
    verifyToken,
    departmentController.getAllDepartments
);

// ======================================
// Get Department By ID
// ======================================
router.get(
    "/:id",
    verifyToken,
    departmentController.getDepartmentById
);

// ======================================
// Update Department
// ======================================
router.put(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    departmentController.updateDepartment
);

// ======================================
// Delete Department
// ======================================
router.delete(
    "/:id",
    verifyToken,
    verifyRole("admin"),
    departmentController.deleteDepartment
);

module.exports = router;