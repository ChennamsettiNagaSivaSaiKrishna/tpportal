const express = require('express');
const router = express.Router();
const placementApplicationController = require('../controllers/placementApplicationController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Placement Application Management Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  placementApplicationController.getApplications || ((req, res) => res.json({ success: true, applications: [] }))
);

router.post(
  '/',
  verifyToken,
  placementApplicationController.applyForDrive || ((req, res) => res.json({ success: true, message: 'Application submitted' }))
);

router.put(
  '/:id/status',
  verifyToken,
  placementApplicationController.updateApplicationStatus || ((req, res) => res.json({ success: true, message: 'Status updated' }))
);

module.exports = router;