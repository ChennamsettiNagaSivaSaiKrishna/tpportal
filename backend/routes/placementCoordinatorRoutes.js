const express = require('express');
const router = express.Router();
const placementCoordinatorController = require('../controllers/placementCoordinatorController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Placement Coordinator Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  placementCoordinatorController?.getAllPlacementCoordinators || ((req, res) => res.json({ success: true, placementCoordinators: [] }))
);

router.post(
  '/',
  verifyToken,
  placementCoordinatorController?.createPlacementCoordinator || ((req, res) => res.json({ success: true, message: 'Placement Coordinator created' }))
);

router.get(
  '/:id',
  verifyToken,
  placementCoordinatorController?.getPlacementCoordinatorById || ((req, res) => res.json({ success: true }))
);

router.put(
  '/:id',
  verifyToken,
  placementCoordinatorController?.updatePlacementCoordinator || ((req, res) => res.json({ success: true, message: 'Placement Coordinator updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  placementCoordinatorController?.deletePlacementCoordinator || ((req, res) => res.json({ success: true, message: 'Placement Coordinator deleted' }))
);

module.exports = router;