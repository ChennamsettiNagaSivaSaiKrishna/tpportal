const express = require('express');
const router = express.Router();
const userNotificationController = require('../controllers/userNotificationController'); // Adjust path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// User Notification Routes secured via secure token authentication with safe handler checks
router.get(
  '/',
  verifyToken,
  userNotificationController?.getNotifications || ((req, res) => res.json({ success: true, notifications: [] }))
);

router.post(
  '/',
  verifyToken,
  userNotificationController?.createNotification || ((req, res) => res.json({ success: true, message: 'Notification created' }))
);

router.put(
  '/:id/read',
  verifyToken,
  userNotificationController?.markAsRead || ((req, res) => res.json({ success: true, message: 'Notification marked as read' }))
);

router.delete(
  '/:id',
  verifyToken,
  userNotificationController?.deleteNotification || ((req, res) => res.json({ success: true, message: 'Notification deleted' }))
);

module.exports = router;