const express = require("express");

const router = express.Router();

const offerController = require("../controllers/offerController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// ======================================
// Add Offer
// ======================================
router.post(
    "/",
    verifyToken,
    verifyRole("placement_officer"),
    offerController.addOffer
);

// ======================================
// Get Student Offers
// ======================================
router.get(
    "/student/:student_roll",
    verifyToken,
    offerController.getStudentOffers
);

// ======================================
// Get All Offers
// ======================================
router.get(
    "/",
    verifyToken,
    verifyRole("placement_officer"),
    offerController.getAllOffers
);

// ======================================
// Update Offer
// ======================================
router.put(
    "/:id",
    verifyToken,
    verifyRole("placement_officer"),
    offerController.updateOffer
);

// ======================================
// Student Accept / Reject Offer
// ======================================
router.put(
    "/accept/:id",
    verifyToken,
    verifyRole("student"),
    offerController.acceptOffer
);

// ======================================
// Delete Offer
// ======================================
router.delete(
    "/:id",
    verifyToken,
    verifyRole("placement_officer"),
    offerController.deleteOffer
);

module.exports = router;