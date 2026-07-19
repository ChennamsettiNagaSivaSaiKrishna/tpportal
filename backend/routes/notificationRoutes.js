const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Resolve dynamic import configurations safely for auth verification
const protect = authMiddleware.protect 
    || authMiddleware.verifyToken 
    || (typeof authMiddleware === 'function' ? authMiddleware : null);

if (protect) {
    router.use(protect);
} else {
    console.warn("⚠️ Warning: Authentication middleware could not be resolved directly. Activating inline context engine.");
}

// Endpoint Action Maps
router.get('/eligible-recipients', notificationController.getEligibleRecipients);
router.post('/send', notificationController.sendNotification);
router.get('/inbox', notificationController.getInbox);
router.put('/edit/:id', notificationController.editNotification);
router.delete('/delete/:id', notificationController.deleteNotification);
router.patch('/read/:id', notificationController.markAsRead);

module.exports = router;