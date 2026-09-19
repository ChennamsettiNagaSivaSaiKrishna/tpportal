const express = require('express');
const router = express.Router();
const phaseBatchController = require('../controllers/phaseBatchController');
const verifyToken = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

// 1. Get All Batches
router.get(
  '/',
  verifyToken,
  requirePermission('PHASE_BATCH_VIEW'),
  phaseBatchController.getAllBatches
);

// 2. Get Batches By Phase ID
router.get(
  '/phase/:phaseId',
  verifyToken,
  requirePermission('PHASE_BATCH_VIEW'),
  phaseBatchController.getBatchesByPhase
);

// 3. Get Batch By ID
router.get(
  '/:id',
  verifyToken,
  requirePermission('PHASE_BATCH_VIEW'),
  phaseBatchController.getBatchById
);

// 4. Create Batch
router.post(
  '/',
  verifyToken,
  requirePermission('PHASE_BATCH_CREATE'),
  phaseBatchController.createBatch
);

// 5. Update Batch
router.put(
  '/:id',
  verifyToken,
  requirePermission('PHASE_BATCH_UPDATE'),
  phaseBatchController.updateBatch
);

// 6. Delete Batch
router.delete(
  '/:id',
  verifyToken,
  requirePermission('PHASE_BATCH_DELETE'),
  phaseBatchController.deleteBatch
);

module.exports = router;