const express = require('express');
const router = express.Router();
const trainingPhaseController = require('../controllers/trainingPhaseController');
const verifyToken = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

// 1. Get All Phases
router.get(
  '/',
  verifyToken,
  requirePermission('TRAINING_PHASE_VIEW'),
  trainingPhaseController.getAllPhases
);

// 2. Get Phase Details by ID
router.get(
  '/:id',
  verifyToken,
  requirePermission('TRAINING_PHASE_VIEW'),
  trainingPhaseController.getPhaseById
);

// 3. Create Phase
router.post(
  '/',
  verifyToken,
  requirePermission('TRAINING_PHASE_CREATE'),
  trainingPhaseController.createPhase
);

// 4. Update Phase
router.put(
  '/:id',
  verifyToken,
  requirePermission('TRAINING_PHASE_UPDATE'),
  trainingPhaseController.updatePhase
);

// 5. Delete Phase
router.delete(
  '/:id',
  verifyToken,
  requirePermission('TRAINING_PHASE_DELETE'),
  trainingPhaseController.deletePhase
);

module.exports = router;