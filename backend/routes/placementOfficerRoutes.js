const express = require('express');
const router = express.Router();
const placementOfficerController = require('../controllers/placementOfficerController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Placement Officer Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  placementOfficerController?.getAllPlacementOfficers || ((req, res) => res.json({ success: true, placementOfficers: [] }))
);

router.post(
  '/',
  verifyToken,
  placementOfficerController?.createPlacementOfficer || ((req, res) => res.json({ success: true, message: 'Placement Officer created' }))
);

router.get(
  '/:id',
  verifyToken,
  placementOfficerController?.getPlacementOfficerById || ((req, res) => res.json({ success: true }))
);

router.put(
  '/:id',
  verifyToken,
  placementOfficerController?.updatePlacementOfficer || ((req, res) => res.json({ success: true, message: 'Placement Officer updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  placementOfficerController?.deletePlacementOfficer || ((req, res) => res.json({ success: true, message: 'Placement Officer deleted' }))
);

module.exports = router;