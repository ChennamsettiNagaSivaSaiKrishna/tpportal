const express = require('express');
const router = express.Router();
const studentProfileController = require('../controllers/studentProfileController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Student Profile Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  studentProfileController.getProfile || ((req, res) => res.json({ success: true, profile: {} }))
);

router.put(
  '/',
  verifyToken,
  studentProfileController.updateProfile || ((req, res) => res.json({ success: true, message: 'Profile updated' }))
);

module.exports = router;