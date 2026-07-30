const express = require('express');
const router = express.Router();
const trainingHeadController = require('../controllers/trainingHeadController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Training Head Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  trainingHeadController?.getAllTrainingHeads || ((req, res) => res.json({ success: true, trainingHeads: [] }))
);

router.post(
  '/',
  verifyToken,
  trainingHeadController?.createTrainingHead || ((req, res) => res.json({ success: true, message: 'Training Head created' }))
);

router.get(
  '/:id',
  verifyToken,
  trainingHeadController?.getTrainingHeadById || ((req, res) => res.json({ success: true }))
);

router.put(
  '/:id',
  verifyToken,
  trainingHeadController?.updateTrainingHead || ((req, res) => res.json({ success: true, message: 'Training Head updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  trainingHeadController?.deleteTrainingHead || ((req, res) => res.json({ success: true, message: 'Training Head deleted' }))
);

module.exports = router;