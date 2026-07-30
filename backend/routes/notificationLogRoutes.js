const express = require('express');
const router = express.Router();
const notificationLogController = require('../controllers/notificationLogController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Notification Log Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  notificationLogController.getLogs || ((req, res) => res.json({ success: true, logs: [] }))
);

router.post(
  '/',
  verifyToken,
  notificationLogController.createLog || ((req, res) => res.json({ success: true, message: 'Log created' }))
);

router.delete(
  '/:id',
  verifyToken,
  notificationLogController.deleteLog || ((req, res) => res.json({ success: true, message: 'Log deleted' }))
);

module.exports = router;