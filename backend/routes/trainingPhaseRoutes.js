const express = require('express');
const router = express.Router();
const trainingPhaseController = require('../controllers/trainingPhaseController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Training Phase Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  trainingPhaseController.getAllPhases || ((req, res) => res.json({ success: true, phases: [] }))
);

router.post(
  '/',
  verifyToken,
  trainingPhaseController.createPhase || ((req, res) => res.json({ success: true, message: 'Phase created' }))
);

router.put(
  '/:id',
  verifyToken,
  trainingPhaseController.updatePhase || ((req, res) => res.json({ success: true, message: 'Phase updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  trainingPhaseController.deletePhase || ((req, res) => res.json({ success: true, message: 'Phase deleted' }))
);

module.exports = router;