const express = require("express");

const router = express.Router();

const announcementController = require("../controllers/announcementController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add Announcement
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
    announcementController.addAnnouncement
);

// ======================================
// Get All Announcements
// ======================================
router.get(
    "/",
    verifyToken,
    announcementController.getAllAnnouncements
);

// ======================================
// Get Announcement By ID
// ======================================
router.get(
    "/:id",
    verifyToken,
    announcementController.getAnnouncementById
);

// ======================================
// Update Announcement
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
    announcementController.updateAnnouncement
);

// ======================================
// Delete Announcement
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
    announcementController.deleteAnnouncement
);

module.exports = router;