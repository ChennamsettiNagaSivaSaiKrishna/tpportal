const express = require("express");

const router = express.Router();

const trainingPhaseController = require("../controllers/trainingPhaseController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add Training Phase
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole("trainings_head"),
    trainingPhaseController.addPhase
);

// ======================================
// Get All Training Phases
// ======================================
router.get(
    "/",
    verifyToken,
    trainingPhaseController.getAllPhases
);

// ======================================
// Get Training Phase By ID
// ======================================
router.get(
    "/:id",
    verifyToken,
    trainingPhaseController.getPhaseById
);

// ======================================
// Update Training Phase
// ======================================
router.put(
    "/:id",
    verifyToken,
    verifyRole("trainings_head"),
    trainingPhaseController.updatePhase
);

// ======================================
// Delete Training Phase
// ======================================
router.delete(
    "/:id",
    verifyToken,
    verifyRole("trainings_head"),
    trainingPhaseController.deletePhase
);

module.exports = router;