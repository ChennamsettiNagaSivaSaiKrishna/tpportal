const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Robustly extract the authentication handler from any export configuration style
const protect = authMiddleware.protect 
    || authMiddleware.verifyToken 
    || (typeof authMiddleware === 'function' ? authMiddleware : null);

if (protect) {
    router.use(protect);
} else {
    console.warn("⚠️ Warning: Authentication middleware could not be resolved directly. Activating inline controller decoding engine.");
}

// Map endpoints cleanly
router.get('/eligible-recipients', notificationController.getEligibleRecipients);
router.post('/send', notificationController.sendNotification);
router.get('/inbox', notificationController.getInbox);
router.patch('/read/:id', notificationController.markAsRead);

module.exports = router;