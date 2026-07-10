const express = require("express");

const router = express.Router();

const studentPhaseAllocationController = require("../controllers/studentPhaseAllocationController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add Allocation
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole("trainings_head"),
    studentPhaseAllocationController.addAllocation
);

// ======================================
// Get All Allocations
// ======================================
router.get(
    "/",
    verifyToken,
    studentPhaseAllocationController.getAllAllocations
);

// ======================================
// Get Allocation By ID
// ======================================
router.get(
    "/:id",
    verifyToken,
    studentPhaseAllocationController.getAllocationById
);

// ======================================
// Update Allocation
// ======================================
router.put(
    "/:id",
    verifyToken,
    verifyRole("trainings_head"),
    studentPhaseAllocationController.updateAllocation
);

// ======================================
// Delete Allocation
// ======================================
router.delete(
    "/:id",
    verifyToken,
    verifyRole("trainings_head"),
    studentPhaseAllocationController.deleteAllocation
);

module.exports = router;