console.log("PHASE BATCH ROUTES LOADED");
const express = require("express");

const router = express.Router();

const phaseBatchController = require("../controllers/phaseBatchController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// Add Batch
router.post(
    "/",
    verifyToken,
    verifyRole("trainings_head"),
    phaseBatchController.addBatch
);

// Get All Batches
router.get(
    "/",
    verifyToken,
    phaseBatchController.getAllBatches
);

// Get Batch By ID
router.get(
    "/:id",
    verifyToken,
    phaseBatchController.getBatchById
);

// Update Batch
router.put(
    "/:id",
    verifyToken,
    verifyRole("trainings_head"),
    phaseBatchController.updateBatch
);

// Delete Batch
router.delete(
    "/:id",
    verifyToken,
    verifyRole("trainings_head"),
    phaseBatchController.deleteBatch
);

module.exports = router;