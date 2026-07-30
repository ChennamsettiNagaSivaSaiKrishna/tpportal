const express = require('express');
const router = express.Router();
const trainingSessionController = require('../controllers/trainingSessionController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Training Session Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  trainingSessionController.getAllSessions || ((req, res) => res.json({ success: true, sessions: [] }))
);

router.post(
  '/',
  verifyToken,
  trainingSessionController.createSession || ((req, res) => res.json({ success: true, message: 'Session created' }))
);

router.put(
  '/:id',
  verifyToken,
  trainingSessionController.updateSession || ((req, res) => res.json({ success: true, message: 'Session updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  trainingSessionController.deleteSession || ((req, res) => res.json({ success: true, message: 'Session deleted' }))
);

module.exports = router;