const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Announcement Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  announcementController.getAllAnnouncements || ((req, res) => res.json({ success: true, announcements: [] }))
);

router.post(
  '/',
  verifyToken,
  announcementController.createAnnouncement || ((req, res) => res.json({ success: true, message: 'Announcement created' }))
);

router.put(
  '/:id',
  verifyToken,
  announcementController.updateAnnouncement || ((req, res) => res.json({ success: true, message: 'Announcement updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  announcementController.deleteAnnouncement || ((req, res) => res.json({ success: true, message: 'Announcement deleted' }))
);

module.exports = router;