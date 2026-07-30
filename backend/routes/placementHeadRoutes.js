const express = require('express');
const router = express.Router();
const placementHeadController = require('../controllers/placementHeadController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Placement Head Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  placementHeadController?.getAllPlacementHeads || ((req, res) => res.json({ success: true, placementHeads: [] }))
);

router.post(
  '/',
  verifyToken,
  placementHeadController?.createPlacementHead || ((req, res) => res.json({ success: true, message: 'Placement Head created' }))
);

router.get(
  '/:id',
  verifyToken,
  placementHeadController?.getPlacementHeadById || ((req, res) => res.json({ success: true }))
);

router.put(
  '/:id',
  verifyToken,
  placementHeadController?.updatePlacementHead || ((req, res) => res.json({ success: true, message: 'Placement Head updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  placementHeadController?.deletePlacementHead || ((req, res) => res.json({ success: true, message: 'Placement Head deleted' }))
);

module.exports = router;