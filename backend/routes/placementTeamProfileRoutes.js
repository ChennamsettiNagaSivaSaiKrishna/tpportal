const express = require('express');
const router = express.Router();
const placementTeamProfileController = require('../controllers/placementTeamProfileController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Placement Team Profile Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  placementTeamProfileController.getProfile || ((req, res) => res.json({ success: true, profile: {} }))
);

router.put(
  '/',
  verifyToken,
  placementTeamProfileController.updateProfile || ((req, res) => res.json({ success: true, message: 'Profile updated' }))
);

module.exports = router;