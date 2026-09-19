const express = require('express');
const router = express.Router();
const trainingSessionController = require('../controllers/trainingSessionController');
const verifyToken = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

// 1. Get All Sessions
router.get(
  '/',
  verifyToken,
  requirePermission('TRAINING_SESSION_VIEW'),
  trainingSessionController.getAllSessions
);

// 2. Get Sessions By Batch ID
router.get(
  '/batch/:batchId',
  verifyToken,
  requirePermission('TRAINING_SESSION_VIEW'),
  trainingSessionController.getSessionsByBatch
);

// 3. Get Session By ID
router.get(
  '/:id',
  verifyToken,
  requirePermission('TRAINING_SESSION_VIEW'),
  trainingSessionController.getSessionById
);

// 4. Create Training Session
router.post(
  '/',
  verifyToken,
  requirePermission('TRAINING_SESSION_CREATE'),
  trainingSessionController.createSession
);

// 5. Update Training Session
router.put(
  '/:id',
  verifyToken,
  requirePermission('TRAINING_SESSION_UPDATE'),
  trainingSessionController.updateSession
);

// 6. Delete Training Session
router.delete(
  '/:id',
  verifyToken,
  requirePermission('TRAINING_SESSION_DELETE'),
  trainingSessionController.deleteSession
);

module.exports = router;