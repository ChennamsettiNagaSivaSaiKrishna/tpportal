const express = require("express");

const router = express.Router();

const trainingSessionController = require("../controllers/trainingSessionController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add Training Session
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole("trainings_head"),
    trainingSessionController.addSession
);

// ======================================
// Get All Training Sessions
// ======================================
router.get(
    "/",
    verifyToken,
    trainingSessionController.getAllSessions
);

// ======================================
// Get Training Session By ID
// ======================================
router.get(
    "/:id",
    verifyToken,
    trainingSessionController.getSessionById
);

// ======================================
// Update Training Session
// ======================================
router.put(
    "/:id",
    verifyToken,
    verifyRole("trainings_head"),
    trainingSessionController.updateSession
);

// ======================================
// Delete Training Session
// ======================================
router.delete(
    "/:id",
    verifyToken,
    verifyRole("trainings_head"),
    trainingSessionController.deleteSession
);

module.exports = router;