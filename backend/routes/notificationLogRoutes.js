const express = require("express");

const router = express.Router();

const notificationLogController = require("../controllers/notificationLogController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add Notification
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole(
        "placement_head",
        "placement_officer",
        "placement_coordinator",
        "trainings_head"
    ),
    notificationLogController.addNotification
);

// ======================================
// Get All Notifications
// ======================================
router.get(
    "/",
    verifyToken,
    notificationLogController.getAllNotifications
);

// ======================================
// Get Notification By ID
// ======================================
router.get(
    "/:id",
    verifyToken,
    notificationLogController.getNotificationById
);

// ======================================
// Update Notification
// ======================================
router.put(
    "/:id",
    verifyToken,
    verifyRole(
        "placement_head",
        "placement_officer",
        "placement_coordinator",
        "trainings_head"
    ),
    notificationLogController.updateNotification
);

// ======================================
// Delete Notification
// ======================================
router.delete(
    "/:id",
    verifyToken,
    verifyRole(
        "placement_head",
        "placement_officer",
        "placement_coordinator",
        "trainings_head"
    ),
    notificationLogController.deleteNotification
);

module.exports = router;