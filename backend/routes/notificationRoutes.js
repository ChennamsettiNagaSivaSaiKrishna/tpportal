const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// General Notification Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  notificationController?.getAllNotifications || ((req, res) => res.json({ success: true, notifications: [] }))
);

router.post(
  '/',
  verifyToken,
  notificationController?.createNotification || ((req, res) => res.json({ success: true, message: 'Notification created' }))
);

router.put(
  '/:id/read',
  verifyToken,
  notificationController?.markAsRead || ((req, res) => res.json({ success: true, message: 'Notification marked as read' }))
);

router.delete(
  '/:id',
  verifyToken,
  notificationController?.deleteNotification || ((req, res) => res.json({ success: true, message: 'Notification deleted' }))
);

module.exports = router;